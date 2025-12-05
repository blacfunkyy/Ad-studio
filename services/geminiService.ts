import { GoogleGenAI, Modality, Type } from "@google/genai";
import { AdFormData, Client, GeminiImagePart, GeneratedAdResult } from "../types";

const fileToBase64 = async (fileOrString: File | string): Promise<{base64: string, mimeType: string}> => {
    if (typeof fileOrString === 'string') {
        // It's a data URL, extract base64 and mimeType
        const [header, data] = fileOrString.split(',');
        const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
        return { base64: data, mimeType };
    }
    // It's a file, read it
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(fileOrString);
        reader.onload = () => {
            const result = reader.result as string;
            // remove the data:image/...;base64, prefix
            resolve({ base64: result.split(',')[1], mimeType: fileOrString.type });
        };
        reader.onerror = (error) => reject(new Error("Failed to read file."));
    });
};

const STYLE_PROMPTS: Record<string, string> = {
  "Minimalist & Clean": "Design a minimalist, clean composition with vast negative space. Use soft, neutral colors and simple geometric forms. Avoid clutter. Lighting should be soft and diffused. High-key photography style.",
  "Bold & Modern": "Create a bold, modern design with high contrast and vibrant, saturated colors. Use dynamic angles and sharp geometric shapes. Tech-inspired aesthetic with a sleek finish.",
  "Elegant & Luxurious": "Generate an image with a luxurious, high-end feel. Use a color palette of black, gold, silver, or deep jewel tones. Textures should look like silk, velvet, marble, or polished metal. Dramatic, cinematic lighting with bokeh effects.",
  "Playful & Vibrant": "Design a playful, energetic background with bright, poppy colors. Use rounded shapes and 3D-rendered elements with a clay-like or plastic texture. Soft shadows and even lighting.",
  "Futuristic & Techy": "Create a futuristic, sci-fi inspired background. Use neon lights, cybernetic patterns, and a dark background with glowing accents (cyan, magenta, electric blue). Digital art style.",
  "Retro & Vintage": "Apply a retro, vintage aesthetic (70s, 80s, or 90s). Use noise, grain, and slightly washed-out colors. Patterns like halftones or synthwave grids.",
  "Natural & Organic": "Use natural elements like leaves, wood, stone, and water. Earthy color palette (greens, browns, beiges). Soft, natural sunlight. Eco-friendly and fresh vibe.",
  "Corporate & Professional": "Design a professional, corporate background. Use clean lines, shades of blue and grey, and abstract architectural elements or office-like environments. Trustworthy and stable feel.",
  "Grunge & Edgy": "Create a grunge, edgy style with distressed textures, urban elements, and darker, moodier lighting. Street art influence.",
  "Hand-drawn & Artisanal": "Simulate a hand-drawn or watercolor artistic style. Textured paper background, sketch-like lines, and pastel colors."
};

export const generateAd = async (formData: AdFormData, client?: Client): Promise<GeneratedAdResult[]> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
  }
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const allGeneratedResults: GeneratedAdResult[] = [];

  for (const size of formData.adSizes) {
    const parts: (GeminiImagePart | {text: string})[] = [];
    const imagePrompts: string[] = [];
    let imageCounter = 0;

    const addImagePart = async (file: File | string, description: string) => {
      const { base64, mimeType } = await fileToBase64(file);
      parts.push({
        inlineData: {
          data: base64,
          mimeType: mimeType,
        }
      });
      imageCounter++;
      const position = ["first", "second", "third", "fourth"][imageCounter -1] || `${imageCounter}th`;
      imagePrompts.push(`- The ${position} image is the ${description}.`);
    };

    if (formData.backgroundImage) await addImagePart(formData.backgroundImage, "background inspiration");
    
    // Note: We intentionally DO NOT add the client logo to the image generation prompt anymore.
    // The logo will be overlayed as an HTML element so it can be moved/scaled by the user.
    
    let templateStylePrompt = '';
    if (formData.templateStyleImage) {
      if (formData.recreateTemplate) {
        await addImagePart(formData.templateStyleImage, "style reference to be recreated without text");
        templateStylePrompt = `
        **CRITICAL INSTRUCTION FOR TEMPLATE RECREATION**: You have been provided with a template image.
        Your task is to generate a new background image that perfectly matches the style, colors, composition, and non-textual elements of the template.
        The generated image MUST have the exact same dimensions as the provided template image.
        You MUST completely remove all text (like headers, logos, paragraphs, or button text) from the original template logic.
        The goal is a clean version of the template's background, ready for new text to be added later.
        `;
      } else {
        await addImagePart(formData.templateStyleImage, "style reference template");
        templateStylePrompt = `- Use the style, layout, and composition of the template image as a strong inspiration for the ad's design.`;
      }
    }
    
    const characterStylePrompt = (formData.characterStyle && formData.characterStyle !== "Default (No specific character style)")
      ? `- If the ad includes any people or characters, they MUST be in a "${formData.characterStyle}" style.`
      : '';

    const aestheticInstruction = STYLE_PROMPTS[formData.creativeStyle] || "Create a high-quality, professional background.";

    let prompt = `
    **ABSOLUTELY CRITICAL INSTRUCTIONS - READ CAREFULLY:**
    1. **NO TEXT IN IMAGE:** Do not render, draw, or include ANY text, letters, words, or numbers in the generated image. Text will be added via HTML overlay later. The image must be art/background only.
    2. **FULL BLEED / NO BORDERS:** The image must be full-bleed. Do NOT add white borders, frames, margins, or padding around the edges. The visual content must extend to the very edge of the canvas.
    3. **ASPECT RATIO:** The final image must be optimized for the "${size}" aspect ratio.

    **Task:** Generate a professional advertising background image.
    
    **Context:**
    - This is a "${formData.adType}" ad.
    - Use the following aesthetic style: "${formData.creativeStyle}". 
    - **Style Details:** ${aestheticInstruction}
    
    **Composition:**
    - Leave appropriate negative space (empty areas without busy details) for text overlay.
    - The text that will be overlaid later (DO NOT WRITE THIS IN IMAGE): "${formData.header1}".
    
    **Inputs:**
    ${imagePrompts.join('\n')}

    ${characterStylePrompt}
    ${templateStylePrompt}
    ${client ? `- Use the brand's color palette: Primary (${client.colors.primary}), Secondary (${client.colors.secondary}), and Tertiary (${client.colors.tertiary}).` : ''}
    ${formData.prompt ? `- Additional User Instructions: ${formData.prompt}`: ''}

    **Final Check:**
    - Is there any text in the image? If yes, remove it.
    - Are there white borders? If yes, extend the background to the edge.
    `;
    parts.push({ text: prompt });

    let response;
    try {
        response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: parts },
            config: { responseModalities: [Modality.IMAGE] },
        });

        const candidate = response.candidates?.[0];
        if (candidate?.content?.parts) {
          for (const part of candidate.content.parts) {
            if (part.inlineData) {
              const base64ImageBytes: string = part.inlineData.data;
              allGeneratedResults.push({
                imageUrl: `data:image/png;base64,${base64ImageBytes}`,
                formData: { ...formData, adSizes: [size] }, // Pass a copy of form data for this specific size
              });
            }
          }
        } else {
            if (response.promptFeedback?.blockReason) {
                throw new Error(`Request for size ${size} was blocked due to ${response.promptFeedback.blockReason}.`);
            }
        }
    } catch (error) {
        console.error(`Failed to generate ad for size ${size}.`, error);
        throw new Error(`Failed to generate ad for size ${size}. Please check the console for details.`);
    }
  }

  if (allGeneratedResults.length === 0) {
    throw new Error("No images were generated by the API. The prompt might have been too complex or blocked.");
  }

  return allGeneratedResults;
};

export const generateAdDetails = async (brief: string): Promise<Partial<AdFormData>> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `You are an expert copywriter. Based on the following brief, generate compelling ad copy. 
  The response must be in JSON format.
  - header1: A short, punchy headline (max 5 words).
  - header2: An optional, slightly longer sub-headline (max 8 words).
  - description: A concise and persuasive description (max 20 words).
  - cta: A strong, clear call to action (max 3 words).

  Brief: "${brief}"`;

  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    header1: { type: Type.STRING, description: "Main headline" },
                    header2: { type: Type.STRING, description: "Secondary headline" },
                    description: { type: Type.STRING, description: "Ad description" },
                    cta: { type: Type.STRING, description: "Call to Action text" },
                },
                required: ["header1", "description", "cta"]
            }
        }
    });

    // Trim whitespace from the response text before parsing, as per best practices.
    const adDetails = JSON.parse(response.text.trim());
    return adDetails;

  } catch(e) {
    console.error("Error generating ad details:", e);
    throw new Error("Failed to generate ad copy. The model may have returned an invalid response.");
  }
};