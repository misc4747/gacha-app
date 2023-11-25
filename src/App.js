import React, { useState, useMemo } from "react";
import styles from "./App.module.css";
import initialItemsWithProbability from "./sample.json"; // 初期JSONファイル

// 確率に応じて要素をランダムに返す関数
function getRandomElementByProbability(probabilityMap) {
  let sum = 0;
  let r = Math.random();

  for (const [item, data] of Object.entries(probabilityMap)) {
    sum += data.probability;
    if (r <= sum) {
      return item;
    }
  }
  return null;
}

function App() {
  const [sum, setSum] = useState(1);
  const [extractionHistory, setExtractionHistory] = useState([]);
  const [itemCounts, setItemCounts] = useState({});
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [itemsWithProbability, setItems] = useState(
    initialItemsWithProbability
  );

  const topItems = useMemo(
    () =>
      Object.entries(itemsWithProbability)
        .map(([name, data]) => ({
          name,
          probability: data.probability,
          metadata: data.metadata,
        }))
        .sort((a, b) => b.probability - a.probability)
        .slice(0, 10),
    [itemsWithProbability]
  );

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const handleClick = () => {
    const result = getRandomElementByProbability(itemsWithProbability);
    if (!result) return;

    setSum((prevSum) => prevSum + 1);
    setItemCounts((prevCounts) => ({
      ...prevCounts,
      [result]: (prevCounts[result] || 0) + 1,
    }));

    setExtractionHistory((prevHistory) => {
      const newHistoryItem = {
        name: result,
        count: setItemCounts[result],
        sum: sum
      };

      const newHistory = [newHistoryItem, ...prevHistory];
      if (newHistory.length > 5) newHistory.pop();
      return newHistory;
    });
  };

  const handleReset = () => {
    setExtractionHistory([]);
    setItemCounts({});
    setSum(1);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        setItems(json);
      } catch (error) {
        console.error("JSON parsing error:", error);
      }
    };
    reader.readAsText(file);
    handleReset();
  };

  const triggerFileInput = () => {
    document.getElementById("fileInput").click();
  };

  const extractionRanking = useMemo(() => {
    const ranking = Object.entries(itemCounts).map(([name, count]) => ({
      name,
      count,
    }));
    return ranking.sort((a, b) => b.count - a.count).slice(0, 10);
  }, [itemCounts]);

  return (
    <div className={styles.appLayout}>
      <button className={styles.hamburger} onClick={toggleSidebar}>
        ☰
      </button>
      <aside
        className={`${styles.sidebar} ${
          isSidebarVisible ? styles.sidebarVisible : ""
        }`}
      >
        <h2>確率が高い順(TOP10)</h2>
        <ul>
          {topItems.map((item, index) => (
            <li key={index}>
              {item.name} - {(item.probability * 100).toFixed(2)}%
            </li>
          ))}
        </ul>
        <h2>出現回数順(TOP10)</h2>
        <ul>
          {extractionRanking.map((item, index) => (
            <li key={index}>
              {index + 1}. {item.name} - {item.count}回
            </li>
          ))}
        </ul>
      </aside>
      <main className={styles.mainContent}>
        <h1>任意ガチャ</h1>
        <pre>
          <code>
            {`{"要素A": { "probability": 0.7 },
"要素B": { "probability": 0.3 }}`}
          </code>
        </pre>
        <p>上記の形式のJSONファイルをアップロードしてください。(probabilityは合計1にしてください)</p>
        <input
          type="file"
          id="fileInput"
          style={{ display: "none" }}
          accept=".json"
          onChange={handleFileUpload}
        />
        <button className={styles.fileUploadButton} onClick={triggerFileInput}>
          ファイルをアップロード
        </button>
        <div className={styles.buttonContainer}>
          <button onClick={handleClick} className={styles.extractButton}>
            抽選
          </button>
          <button onClick={handleReset} className={styles.resetButton}>
            Reset
          </button>
        </div>
        <div className={styles.selectedItemsList}>
          <h2>要素(回数) & 確率</h2>
          <div>
            {extractionHistory.map((item, index) => (
              <div key={index} className={styles.highlightedItem}>
                <div>
                  {item.name}({itemCounts[item.name]}回目 / {item.sum}回中)
                </div>
                <div>
                  {(itemsWithProbability[item.name].probability * 100).toFixed(
                    2
                  )}
                  %
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
