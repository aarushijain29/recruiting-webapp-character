import { useState, useEffect } from 'react';
import './App.css';
import { ATTRIBUTE_LIST, CLASS_LIST, SKILL_LIST } from './consts.js';

function App() {

  // R1: State for attributes (default = 10)
  const [attributes, setAttributes] = useState(
    Object.fromEntries(ATTRIBUTE_LIST.map(attr => [attr, 10]))
  );

    
  // R1: Update attributes
  const updateAttribute = (attrName, delta) => {
    setAttributes(prev => {
      const currentTotal = Object.values(prev).reduce((sum, val) => sum + val, 0);
      const newValue = prev[attrName] + delta;
  
      if (newValue < 1) return prev;
      
      // R7: Cap points at 70
      const newTotal = currentTotal - prev[attrName] + newValue;
      if (newTotal > 70) return prev;
  
      return {
        ...prev,
        [attrName]: newValue,
      };
    });
  };

  // R2: Check if current attribute meets min requirements
  const meetsClassRequirements = (className) => {
    const requiredStats = CLASS_LIST[className];
    return Object.entries(requiredStats).every(([attr, minValue]) =>
      attributes[attr] >= minValue
    );
  };
  
  // R3: Satte selected to display minimum attributes
  const [selectedClass, setSelectedClass] = useState(null);

  

  // R4: Calculate modifier value based on attribute value
  const getModifier = (value) => Math.floor((value - 10) / 2);

  // R5: State for each skill's points
  const [skillPoints, setSkillPoints] = useState(
    Object.fromEntries(SKILL_LIST.map(skill => [skill.name, 0]))
  );
  const intelligenceMod = getModifier(attributes["Intelligence"]);
  const maxSkillPoints = 10 + (4 * intelligenceMod);
  const totalPointsSpent = Object.values(skillPoints).reduce((sum, val) => sum + val, 0);

  // R5: Update skill points
  const updateSkill = (skillName, delta) => {
    setSkillPoints(prev => {
      const newVal = prev[skillName] + delta;
      const newTotal = Object.values(prev).reduce((sum, val) => sum + val, 0) + delta;
      if (newVal < 0 || newTotal > maxSkillPoints) return prev;

      return {
        ...prev,
        [skillName]: newVal
      };
    });
  };

  // R6: Fetch character data from API
  useEffect(() => {
    fetch('https://recruiting.verylongdomaintotestwith.ca/api/{aarushijain29}/character')
      .then(res => res.json())
      .then(data => {
        if (data.attributes) setAttributes(data.attributes);
        if (data.skillPoints) setSkillPoints(data.skillPoints);
        if (data.selectedClass) setSelectedClass(data.selectedClass);
      })
      .catch(err => {
        console.error("Error fetching saved data:", err);
      });
  }, []);

  // R6: Save character data using save button
  const handleSave = () => {
    const dataToSave = {
      attributes,
      skillPoints,
      selectedClass,
    };

    fetch('https://recruiting.verylongdomaintotestwith.ca/api/{aarushijain29}/character', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToSave),
    })
      .then(res => {
        if (res.ok) alert("Character saved successfully!");
        else throw new Error("Failed to save");
      })
      .catch(err => {
        console.error("Error saving character:", err);
        alert("Error saving character");
      });
  };

  // R9: State for skill check UI
  const [checkSkill, setCheckSkill] = useState(SKILL_LIST[0].name);
  const [checkDC, setCheckDC] = useState("10");
  const [rollResult, setRollResult] = useState(null);

  // R9: Perform skill check roll
  const performSkillCheck = () => {
    const skill = SKILL_LIST.find(s => s.name === checkSkill);
    const modifier = getModifier(attributes[skill.attributeModifier]);
    const points = skillPoints[skill.name];
    const total = modifier + points;
    const roll = Math.floor(Math.random() * 20) + 1;
    const dcValue = parseInt(checkDC, 10);
    const success = roll + total >= dcValue;
  
    setRollResult({
      roll,
      total,
      success
    });
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>React Coding Exercise</h1>
      </header>

      <section className="App-section">
        <button onClick={handleSave}>Save Character</button>

        <h2>Attributes</h2>
        {ATTRIBUTE_LIST.map(attr => (
          <div key={attr}>
            {attr}: {attributes[attr]}  
            (modifier: {getModifier(attributes[attr]) >= 0 ? '+' : ''}{getModifier(attributes[attr])}){" "}
            <button onClick={() => updateAttribute(attr, 1)}>+</button>
            <button onClick={() => updateAttribute(attr, -1)}>-</button>
          </div>
        ))}

        <h2>Available Classes</h2>
        {Object.keys(CLASS_LIST).map(className => {
          const isEligible = meetsClassRequirements(className);
          return (
            <div
              key={className}
              onClick={() =>
                setSelectedClass(prev => prev === className ? null : className)
              }
              style={{
                margin: "8px 0",
                padding: "6px",
                border: "1px solid #ffffff",
                borderRadius: "4px",
                backgroundColor: isEligible ? "#50C878" : "#E34234",
                cursor: "pointer",
              }}
            >
              {className}
            </div>
          );
        })}
        {selectedClass && (
          <div style={{ marginTop: "20px" }}>
            <h3>Selected Class: {selectedClass}</h3>
            <p>Minimum attribute requirements:</p>
            <div>
              {Object.entries(CLASS_LIST[selectedClass]).map(([attr, min]) => (
                <div key={attr}>{attr}: {min}</div>
              ))}
            </div>
          </div>
        )}

        <h2>Skills</h2>
        <p>Total Points: {totalPointsSpent} / {maxSkillPoints}</p>
        {SKILL_LIST.map(skill => {
          const attr = skill.attributeModifier;
          const modifier = getModifier(attributes[attr]);
          const points = skillPoints[skill.name];
          const total = points + modifier;

          return (
            <div key={skill.name}>
              {skill.name} - points: {points}{" "}
              <button onClick={() => updateSkill(skill.name, 1)}>+</button>
              <button onClick={() => updateSkill(skill.name, -1)}>-</button>{" "}
              modifier ({attr}): {modifier >= 0 ? "+" : ""}{modifier}{" "}
              total: {total}
            </div>
          );
        })}
        <h2>Skill Check</h2>
        <div>
          Skill:
          <select value={checkSkill} onChange={e => setCheckSkill(e.target.value)}>
            {SKILL_LIST.map(skill => (
              <option key={skill.name} value={skill.name}>
                {skill.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          DC:
          <input
            type="number"
            value={checkDC}
            onChange={e => setCheckDC(e.target.value)}
          />
        </div>

        <button onClick={performSkillCheck}>Roll</button>

        {rollResult && (
          <div style={{ marginTop: "10px" }}>
            <p>Rolled: {rollResult.roll}</p>
            <p>Total (Roll + Modifier + Points): {rollResult.roll + rollResult.total}</p>
            <p>Result: <strong>{rollResult.success ? "Success" : "Fail"}</strong></p>
          </div>
        )}

      </section>
    </div>
  );
}

export default App;
