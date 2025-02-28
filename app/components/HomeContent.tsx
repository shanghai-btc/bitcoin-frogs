import React from 'react';

interface HomeContentProps {
  ordinalId: string;
  setOrdinalId: (value: string) => void;
  handleAnimateClick: () => void;
}

export const HomeContent: React.FC<HomeContentProps> = ({
  ordinalId,
  setOrdinalId,
  handleAnimateClick,
}) => {
  return (
    <div>
      <h1>Bitcoin Frogs</h1>
      <input
        type="number"
        value={ordinalId}
        onChange={(e) => setOrdinalId(e.target.value)}
        placeholder="Ordinal #"
      />
      <button onClick={handleAnimateClick}>
        Animate
      </button>
    </div>
  );
};
