"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function Home() {
  const [ordinalId, setOrdinalId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showRibbitAnimation, setShowRibbitAnimation] = useState<boolean>(false);
  const [frogData, setFrogData] = useState<any>(null);

const handleAnimateClick = async () => {
  if (!ordinalId || isNaN(Number(ordinalId))) return;

  setIsLoading(true);
  try {   
    const response = await fetch(`/api/frog?id=${ordinalId}`); 
    const data = await response.json();
    console.log("API response:", data);  // Add this line
    setFrogData(data);
  } catch (error) {
    console.error("Error fetching frog data:", error);
  } finally {
    setIsLoading(false);
  }   
};

  const handleRibbitClick = () => {
    setShowRibbitAnimation(true);
    setTimeout(() => {
      setShowRibbitAnimation(false);
    }, 3000);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <Image 
          src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExMG1sb3N0emVnaGswdXFzOGo5NXBmaGxudnE0dHJpNDBpdDRkM3pyeiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/1LgeMkmGA5qjPP7orC/giphy.gif"
          alt="Background"
          fill
          style={{ objectFit: 'cover' }}
        />
      </div>

{/* Top right icons */}
<div className="absolute top-[10px] right-[40px] flex gap-5 z-10">
  <div className="w-[115px] h-[80px]">
    <a href="https://magiceden.io/ordinals/marketplace/bitcoin-frogs" target="_blank" rel="noopener noreferrer">
      <Image
        src="https://i.postimg.cc/bNXzVGhG/Me-Logo-Dune.png"
        alt="Bitcoin Frogs"
        width={125}
        height={80}
        className="rounded-[15px]"
      />
    </a>
  </div>
  <div className="w-[90px] h-[65px] relative top-[6px]">
    <a href="https://discord.com/invite/PfGq3z2Xtn" target="_blank" rel="noopener noreferrer">
      <Image
        src="https://i.postimg.cc/Kz2Pxh2x/Discord-Logo-Dune.png"
        alt="Discord Logo"
        width={90}
        height={65}
        className="rounded-[10%]"
      />
    </a>
  </div>
  <div className="w-[75px] h-[50px] relative top-[6px]">
    <a href="https://x.com/BitcoinFrogs" target="_blank" rel="noopener noreferrer">
      <Image
        src="https://i.postimg.cc/s2SYkDbT/X-Logo-Dune.png"
        alt="X Logo"
        width={90}
        height={65}
        className="rounded-[10%]"
      />
    </a>
  </div>
</div>

      {/* RIBBIT button */}
      <div 
        className="absolute top-[17px] left-[57px] text-[30px] font-bold cursor-pointer text-[#fbeb97] transition-transform duration-100 active:scale-95 z-10"
        onClick={handleRibbitClick}
      >
        RIBBIT
      </div>

{/* Main content */}
<div className={`z-10 flex flex-col items-center ${showRibbitAnimation ? 'hidden' : ''}`}>
  <h1 className="text-[72px] font-bold text-[#fbeb97] mb-8" style={{ textShadow: '0 0 1px #ff9800, 0 0 2px #ff9800, 0 0 3px #ff9800' }}>
    Bitcoin Frogs
  </h1>
  
  <div className="flex items-center gap-2 mb-4">
    <input
      type="number"
      value={ordinalId}
      onChange={(e) => setOrdinalId(e.target.value)}
      placeholder="Ordinal #"
      className="p-2.5 text-base w-[80px] text-center"
      min="1"
      max="10000"
    />
    <button
      onClick={handleAnimateClick}
      className="px-5 py-2.5 text-base bg-[#f7931a] text-white border-none transition-all duration-100 hover:bg-[#f7931a]/90 active:scale-95 active:bg-[#d67d00]"
    >
      Animate
    </button>
  </div>
  
{/* Frog animation container */}
<div className="h-[400px] w-[400px] bg-white border border-[#ff9800] rounded-[20px] shadow-lg flex items-center justify-center relative overflow-hidden">
  {isLoading ? (
    <div className="text-gray-500">Loading...</div>
  ) : frogData ? (
    <>
      {frogData.background && <Image src={`/traits/background/${frogData.background}.png`} alt="Background" fill style={{objectFit: 'contain'}} />}
      {frogData.body && <Image src={`/traits/body/${frogData.body}.png`} alt="Body" fill style={{objectFit: 'contain'}} className="animate-float" />}
      {frogData.eyes && <Image src={`/traits/eyes/${frogData.eyes}.png`} alt="Eyes" fill style={{objectFit: 'contain'}} className="animate-float-delayed" />}
      {frogData.mouth && <Image src={`/traits/mouth/${frogData.mouth}.png`} alt="Mouth" fill style={{objectFit: 'contain'}} className="animate-float-delayed" />}
      {frogData.hat && <Image src={`/traits/hat/${frogData.hat}.png`} alt="Hat" fill style={{objectFit: 'contain'}} className="animate-float" />}
      {frogData.accessory && <Image src={`/traits/accessory/${frogData.accessory}.png`} alt="Accessory" fill style={{objectFit: 'contain'}} 
className="animate-float-delayed" />}
    </>
  ) : (
    <div className="text-gray-500">Enter an ordinal number to see your frog</div>
  )}
</div>

      {/* Footer */}
      <div className="absolute bottom-5 right-6 text-lg font-bold text-[#fbeb97] z-10">
        <a 
          href="https://x.com/shanghai_btc" 
          target="_blank" 
          rel="noopener noreferrer"
          className="no-underline text-[#fbeb97] transition-opacity duration-300 hover:opacity-70"
        >
          by @shanghai_btc
        </a>
      </div>

	{/* RIBBIT Animation */}
	{showRibbitAnimation && (
       	 <div className="fixed inset-0 flex items-center justify-center z-50">
       		 <div className="absolute inset-0 bg-black opacity-50"></div>
       		 <Image
		 src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExMWdrbzViaGxvODA1d3UwM3hraWo1MmJpMXF2aDBveXJ3MTRndDUzcyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/X5Ku4zGfBRrVMPVMts/giphy.gif"
 	    	 alt="Frog GIF"
     		 width={450}
     		 height={450}
     		 className="animate-pulse z-50"
     		 unoptimized
    />
  </div>
)}      )}
    </main>
  );
}
