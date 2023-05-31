// https://github.com/Martin36/react-gauge-chart
import GaugeChart from 'react-gauge-chart'
import React, { useState } from 'react';

export default function Gauge() {
  const [temperature, setTemperature] = useState(0);

  function handleTemperatureChange(event) {
    setTemperature(event.target.value);
  }

  return (
    <>
      <div>
        <label htmlFor="valueInput">輸入溫度：</label>
        <input
          id="valueInput"
          type="range"
          min="0"
          max="200"
          step="1"
          value={temperature}
          onChange={handleTemperatureChange}
        />
        <span>{temperature}</span>
      </div>
      <GaugeChart
        id="gauge-chart3"
        nrOfLevels={20} 
        // arcsLength={[0.3, 0.5, 0.2]} //disable nrOfLevels 

        // className="gauge"
        style={{width: 300, height: 300, margin: "0 auto"}}
        // marginInPercent={0.05}
        // arc
        arcWidth={0.3} 
        // arcPadding={0.05} 
        percent={temperature/200} 
        
        textColor="#000000"
        needleColor="#345243" 
        needleBaseColor="#000000"
        formatTextValue={value => temperature + ' .C ('+value+')'}
        // cornerRadius={3}
        animDelay={10}
        animateDuration={2000}
      />

    </>
  );
}