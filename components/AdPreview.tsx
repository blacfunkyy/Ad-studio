import React, { useState, useRef, useEffect } from 'react';
import Spinner from './Spinner';
import { GeneratedAdResult, AdFormData } from '../types';
import Draggable from 'react-draggable';

declare const html2canvas: any;

interface AdPreviewProps {
  isLoading: boolean;
  error: string | null;
  adResults: GeneratedAdResult[];
  onSaveAd: (formData: AdFormData, imageUrls: string[]) => void;
}

const AdPreview: React.FC<AdPreviewProps> = ({ isLoading, error, adResults, onSaveAd }) => {

  const AdCard: React.FC<{ result: GeneratedAdResult; index: number }> = ({ result, index }) => {
    const { formData, imageUrl } = result;
    const adContainerRef = useRef<HTMLDivElement>(null);
    const [isEditing, setIsEditing] = useState(false);

    const [editableFormData, setEditableFormData] = useState<AdFormData>(formData);
    
    // Position and Scale states
    const [h1Pos, setH1Pos] = useState(formData.header1Position || { x: 0, y: 0 });
    const [h1Scale, setH1Scale] = useState(formData.header1Scale || 1);
    const [h2Pos, setH2Pos] = useState(formData.header2Position || { x: 0, y: 0 });
    const [h2Scale, setH2Scale] = useState(formData.header2Scale || 1);
    const [descPos, setDescPos] = useState(formData.descriptionPosition || { x: 0, y: 0 });
    const [descScale, setDescScale] = useState(formData.descriptionScale || 1);
    const [pricePos, setPricePos] = useState(formData.pricePosition || { x: 0, y: 0 });
    const [priceScale, setPriceScale] = useState(formData.priceScale || 1);
    const [salePricePos, setSalePricePos] = useState(formData.salePricePosition || { x: 0, y: 0 });
    const [salePriceScale, setSalePriceScale] = useState(formData.salePriceScale || 1);
    const [ctaPos, setCtaPos] = useState(formData.ctaPosition || { x: 0, y: 0 });
    const [ctaScale, setCtaScale] = useState(formData.ctaScale || 1);
    const [productImgPos, setProductImgPos] = useState(formData.productImagePosition || { x: 0, y: 0 });
    const [productImgScale, setProductImgScale] = useState(formData.productImageScale || 1);
    
    // Logo specific states
    const [logoPos, setLogoPos] = useState(formData.logoPosition || { x: 0, y: 0 });
    const [logoScale, setLogoScale] = useState(formData.logoScale || 1);

    const [productImageUrl, setProductImageUrl] = useState<string | null>(null);
    const [logoImageUrl, setLogoImageUrl] = useState<string | null>(null);

    const h1Ref = useRef(null);
    const h2Ref = useRef(null);
    const descRef = useRef(null);
    const priceRef = useRef(null);
    const salePriceRef = useRef(null);
    const ctaRef = useRef(null);
    const productImgRef = useRef(null);
    const logoRef = useRef(null);
    
    useEffect(() => {
        setEditableFormData(formData);
        setH1Pos(formData.header1Position || { x: 0, y: 0 });
        setH1Scale(formData.header1Scale || 1);
        setH2Pos(formData.header2Position || { x: 0, y: 0 });
        setH2Scale(formData.header2Scale || 1);
        setDescPos(formData.descriptionPosition || { x: 0, y: 0 });
        setDescScale(formData.descriptionScale || 1);
        setPricePos(formData.pricePosition || { x: 0, y: 0 });
        setPriceScale(formData.priceScale || 1);
        setSalePricePos(formData.salePricePosition || { x: 0, y: 0 });
        setSalePriceScale(formData.salePriceScale || 1);
        setCtaPos(formData.ctaPosition || { x: 0, y: 0 });
        setCtaScale(formData.ctaScale || 1);
        setProductImgPos(formData.productImagePosition || { x: 0, y: 0 });
        setProductImgScale(formData.productImageScale || 1);
        setLogoPos(formData.logoPosition || { x: 0, y: 0 });
        setLogoScale(formData.logoScale || 1);
        
        if (formData.productImage) {
            if (typeof formData.productImage === 'string') {
                setProductImageUrl(formData.productImage);
            } else if (formData.productImage instanceof File) {
                const url = URL.createObjectURL(formData.productImage);
                setProductImageUrl(url);
                return () => URL.revokeObjectURL(url);
            }
        } else {
            setProductImageUrl(null);
        }

        if (formData.logoImage) {
            if (typeof formData.logoImage === 'string') {
                setLogoImageUrl(formData.logoImage);
            } else if (formData.logoImage instanceof File) {
                const url = URL.createObjectURL(formData.logoImage);
                setLogoImageUrl(url);
                return () => URL.revokeObjectURL(url);
            }
        } else {
            setLogoImageUrl(null);
        }
    }, [formData]);
    
    const handleSave = () => {
        const finalFormData = {
            ...editableFormData,
            header1Position: h1Pos, header1Scale: h1Scale,
            header2Position: h2Pos, header2Scale: h2Scale,
            descriptionPosition: descPos, descriptionScale: descScale,
            pricePosition: pricePos, priceScale: priceScale,
            salePricePosition: salePricePos, salePriceScale: salePriceScale,
            ctaPosition: ctaPos, ctaScale: ctaScale,
            productImagePosition: productImgPos, productImageScale: productImgScale,
            logoPosition: logoPos, logoScale: logoScale,
        };
        onSaveAd(finalFormData, adResults.map(r => r.imageUrl));
    }

    const handleDownload = () => {
        if (adContainerRef.current) {
            html2canvas(adContainerRef.current, { useCORS: true, backgroundColor: null }).then((canvas: any) => {
                const link = document.createElement('a');
                link.download = `${editableFormData.adName || 'ad'}-${index + 1}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            });
        }
    };
    
    const adSizeParts = editableFormData.adSizes[0].match(/(\d+)x(\d+)/);
    const aspectRatio = adSizeParts ? `${adSizeParts[1]} / ${adSizeParts[2]}` : '1 / 1';

    const ScaleControls: React.FC<{ onScaleUp: () => void, onScaleDown: () => void }> = ({ onScaleUp, onScaleDown }) => (
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 flex gap-1 z-30 bg-gray-900 text-white rounded-full p-1 shadow-lg backdrop-blur-md border border-white/20">
            <button type="button" onClick={onScaleDown} className="w-7 h-7 flex items-center justify-center hover:bg-white/20 rounded-full font-bold text-lg leading-none pb-1">-</button>
            <button type="button" onClick={onScaleUp} className="w-7 h-7 flex items-center justify-center hover:bg-white/20 rounded-full font-bold text-lg leading-none pb-1">+</button>
        </div>
    );
    
    return (
        <div className="flex flex-col items-center space-y-4 p-6 bg-white/50 rounded-3xl border border-white/50 shadow-sm backdrop-blur-md">
            <div className="flex justify-between w-full items-center">
                <div className="flex items-center gap-2">
                    <span className="bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">{editableFormData.adSizes[0]}</span>
                    <span className="text-xs text-gray-500 font-medium">Result #{index + 1}</span>
                </div>
                <button type="button" onClick={() => setIsEditing(!isEditing)} className={`text-xs font-bold px-4 py-2 rounded-full transition-all shadow-sm flex items-center gap-2 ${isEditing ? 'bg-indigo-600 text-white shadow-indigo-300' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`}>
                    {isEditing ? (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                            Done Editing
                        </>
                    ) : (
                         <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                            Adjust Layout
                        </>
                    )}
                </button>
            </div>

            <div ref={adContainerRef} className={`relative w-full shadow-2xl shadow-black/20 bg-gray-100 overflow-hidden select-none rounded-sm transition-all ${isEditing ? 'ring-4 ring-indigo-400 ring-offset-4' : ''}`} style={{ aspectRatio }}>
                <img src={imageUrl} alt={`Generated Ad Background ${index + 1}`} className="absolute top-0 left-0 w-full h-full object-cover" />
                
                {/* Background Overlays (Product / Logo) */}
                <div className="absolute inset-0 overflow-hidden">
                    {productImageUrl && (
                        <Draggable nodeRef={productImgRef} disabled={!isEditing} position={productImgPos} onStop={(_, data) => setProductImgPos({x:data.x, y:data.y})}>
                            <div ref={productImgRef} className={`absolute ${isEditing ? 'cursor-move ring-2 ring-blue-400 ring-dashed' : ''}`} style={{ top: 0, left: 0, transform: `scale(${productImgScale})` }}>
                                 {isEditing && <ScaleControls onScaleUp={() => setProductImgScale(s => s + 0.05)} onScaleDown={() => setProductImgScale(s => Math.max(0.1, s - 0.05))} />}
                                <img src={productImageUrl} alt="Product" className="object-contain" style={{ width: 150, height: 'auto' }} />
                            </div>
                        </Draggable>
                    )}

                    {logoImageUrl && (
                         <Draggable nodeRef={logoRef} disabled={!isEditing} position={logoPos} onStop={(_, data) => setLogoPos({x:data.x, y:data.y})}>
                            <div ref={logoRef} className={`absolute ${isEditing ? 'cursor-move ring-2 ring-blue-400 ring-dashed' : ''}`} style={{ top: 0, left: 0, transform: `scale(${logoScale})` }}>
                                 {isEditing && <ScaleControls onScaleUp={() => setLogoScale(s => s + 0.05)} onScaleDown={() => setLogoScale(s => Math.max(0.1, s - 0.05))} />}
                                <img src={logoImageUrl} alt="Logo" className="object-contain" style={{ width: 100, height: 'auto' }} />
                            </div>
                        </Draggable>
                    )}
                </div>

                {/* Text Overlays */}
                <div className="absolute inset-0 p-8 flex flex-col justify-center text-center items-center gap-2 pointer-events-none">
                    {/* Note: We add pointer-events-auto to the draggable children so they can be grabbed, while the container lets clicks pass through to background elements */}
                    
                    {editableFormData.header1 && 
                        <Draggable nodeRef={h1Ref} disabled={!isEditing} position={h1Pos} onStop={(_, data) => setH1Pos({x:data.x, y:data.y})}>
                            <div ref={h1Ref} className={`relative pointer-events-auto ${isEditing ? 'cursor-move ring-2 ring-blue-400 ring-dashed p-2 bg-black/10' : ''}`}>
                                {isEditing && <ScaleControls onScaleUp={() => setH1Scale(s => s + 0.05)} onScaleDown={() => setH1Scale(s => Math.max(0.1, s - 0.05))} />}
                                <h1 className="font-extrabold text-white leading-tight drop-shadow-lg" style={{ textShadow: '0 4px 12px rgba(0,0,0,0.8)', transform: `scale(${h1Scale})`, fontFamily: editableFormData.header1FontFamily, fontSize: `${editableFormData.header1FontSize}px` }}>{editableFormData.header1}</h1>
                            </div>
                        </Draggable>
                    }
                    {editableFormData.header2 && 
                        <Draggable nodeRef={h2Ref} disabled={!isEditing} position={h2Pos} onStop={(_, data) => setH2Pos({x:data.x, y:data.y})}>
                             <div ref={h2Ref} className={`relative pointer-events-auto ${isEditing ? 'cursor-move ring-2 ring-blue-400 ring-dashed p-2 bg-black/10' : ''}`}>
                                {isEditing && <ScaleControls onScaleUp={() => setH2Scale(s => s + 0.05)} onScaleDown={() => setH2Scale(s => Math.max(0.1, s - 0.05))} />}
                                <h2 className="font-bold text-gray-100 leading-snug drop-shadow-md" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)', transform: `scale(${h2Scale})`, fontFamily: editableFormData.header2FontFamily, fontSize: `${editableFormData.header2FontSize}px` }}>{editableFormData.header2}</h2>
                            </div>
                        </Draggable>
                    }
                    
                    {editableFormData.description && 
                        <Draggable nodeRef={descRef} disabled={!isEditing} position={descPos} onStop={(_, data) => setDescPos({x:data.x, y:data.y})}>
                            <div ref={descRef} className={`relative pointer-events-auto ${isEditing ? 'cursor-move ring-2 ring-blue-400 ring-dashed p-2 bg-black/10' : ''}`}>
                                {isEditing && <ScaleControls onScaleUp={() => setDescScale(s => s + 0.05)} onScaleDown={() => setDescScale(s => Math.max(0.1, s - 0.05))} />}
                                <p className="text-white drop-shadow-md" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)', transform: `scale(${descScale})`, fontFamily: editableFormData.descriptionFontFamily, fontSize: `${editableFormData.descriptionFontSize}px` }}>{editableFormData.description}</p>
                            </div>
                        </Draggable>
                    }

                    <div className="flex gap-4 justify-center items-center pointer-events-auto">
                        {editableFormData.price &&
                            <Draggable nodeRef={priceRef} disabled={!isEditing} position={pricePos} onStop={(_, data) => setPricePos({ x: data.x, y: data.y })}>
                                <div ref={priceRef} className={`relative ${isEditing ? 'cursor-move ring-2 ring-blue-400 ring-dashed p-1' : ''}`}>
                                    {isEditing && <ScaleControls onScaleUp={() => setPriceScale(s => s + 0.05)} onScaleDown={() => setPriceScale(s => Math.max(0.1, s - 0.05))} />}
                                    <p className="text-white font-bold drop-shadow-md" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.6)', transform: `scale(${priceScale})`, fontFamily: editableFormData.priceFontFamily, fontSize: `${editableFormData.priceFontSize}px` }}>{editableFormData.price}</p>
                                </div>
                            </Draggable>
                        }
                        {editableFormData.salePrice &&
                            <Draggable nodeRef={salePriceRef} disabled={!isEditing} position={salePricePos} onStop={(_, data) => setSalePricePos({ x: data.x, y: data.y })}>
                                <div ref={salePriceRef} className={`relative ${isEditing ? 'cursor-move ring-2 ring-blue-400 ring-dashed p-1' : ''}`}>
                                    {isEditing && <ScaleControls onScaleUp={() => setSalePriceScale(s => s + 0.05)} onScaleDown={() => setSalePriceScale(s => Math.max(0.1, s - 0.05))} />}
                                    <p className="text-red-500 font-extrabold bg-white px-3 py-1 shadow-lg rounded-md transform -rotate-2" style={{ transform: `scale(${salePriceScale}) rotate(-2deg)`, fontFamily: editableFormData.salePriceFontFamily, fontSize: `${editableFormData.salePriceFontSize}px` }}>{editableFormData.salePrice}</p>
                                </div>
                            </Draggable>
                        }
                    </div>

                    {editableFormData.cta && (
                        <Draggable nodeRef={ctaRef} disabled={!isEditing} position={ctaPos} onStop={(_, data) => setCtaPos({x:data.x, y:data.y})}>
                            <div ref={ctaRef} className={`relative inline-block pointer-events-auto ${isEditing ? 'cursor-move ring-2 ring-blue-400 ring-dashed' : ''}`}>
                                {isEditing && <ScaleControls onScaleUp={() => setCtaScale(s => s + 0.05)} onScaleDown={() => setCtaScale(s => Math.max(0.1, s - 0.05))} />}
                                <div className="font-bold transition-transform hover:scale-105"
                                    style={{
                                        color: editableFormData.ctaTextColor, backgroundColor: editableFormData.ctaBackgroundColor,
                                        padding: `${editableFormData.ctaPadding}px ${ (editableFormData.ctaPadding || 0) * 2.5}px`,
                                        borderRadius: `${editableFormData.ctaCornerRadius}px`, 
                                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                                        transform: `scale(${ctaScale})`,
                                        fontFamily: editableFormData.ctaFontFamily,
                                        fontSize: `${editableFormData.ctaFontSize}px`
                                    }}>
                                    {editableFormData.cta}
                                </div>
                            </div>
                        </Draggable>
                    )}
                </div>
            </div>
            <div className="flex items-center justify-center gap-3 w-full">
                <button type="button" onClick={handleSave} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-white bg-green-600 rounded-xl hover:bg-green-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                    Save to Library
                </button>
                <button onClick={handleDownload} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-indigo-700 bg-white border border-indigo-100 rounded-xl hover:bg-indigo-50 transition-all shadow-sm hover:shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Download PNG
                </button>
            </div>
        </div>
    );
  };
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center gap-8 text-gray-500 h-full py-20">
          <div className="relative">
              <div className="absolute inset-0 bg-indigo-300 blur-xl opacity-30 animate-pulse rounded-full"></div>
              <Spinner className="w-16 h-16 text-indigo-600 relative z-10" />
          </div>
          <div className="text-center space-y-2">
             <p className="text-2xl font-bold text-gray-800 animate-pulse">Dreaming up your ad...</p>
             <p className="text-sm text-gray-500 max-w-xs mx-auto">Our AI is painting pixels, arranging text, and optimizing for conversion.</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center text-center text-red-500 h-full py-20">
          <div className="bg-red-50 p-6 rounded-full mb-6 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="font-bold text-xl text-gray-800">Something went wrong</p>
          <p className="text-gray-500 mt-2 max-w-sm">{error}</p>
        </div>
      );
    }

    if (adResults.length > 0) {
      return (
        <div className="h-full overflow-y-auto p-8 custom-scrollbar">
            <div className="flex items-center justify-between mb-6">
                 <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <span className="w-2 h-8 bg-indigo-500 rounded-full"></span>
                    Results
                 </h3>
            </div>
            <div className="grid grid-cols-1 gap-12 pb-20">
                {adResults.map((result, index) => <AdCard key={index} result={result} index={index} />)}
            </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center text-center text-gray-400 h-full py-20">
         <div className="bg-white p-8 rounded-3xl shadow-lg shadow-indigo-100 mb-8 border border-gray-50">
            <div className="bg-indigo-50 p-6 rounded-2xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </div>
         </div>
        <h3 className="text-2xl font-bold text-gray-700">Preview Workspace</h3>
        <p className="mt-3 max-w-xs text-gray-500 leading-relaxed">
          Complete the steps on the left to generate your high-conversion creative assets.
        </p>
      </div>
    );
  };

  return (
    <div className="w-full h-full">
      {renderContent()}
    </div>
  );
};

export default AdPreview;