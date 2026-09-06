import React, { useState, useEffect } from 'react';
import './HanoiGame.css';

// Typ dla naszych wież: tablica tablic z numerami (reprezentującymi krążki)
type Towers = number[][];

const HanoiGame: React.FC = () => {
  // Stan przechowujący liczbę krążków
  const [numDisks, setNumDisks] = useState(3);
  
  // Stan przechowujący aktualny układ krążków na wieżach
  const [towers, setTowers] = useState<Towers>([]);
  
  // Stan przechowujący indeks wieży, z której podnosimy krążek
  const [selectedTowerIndex, setSelectedTowerIndex] = useState<number | null>(null);
  
  // Stan licznika ruchów
  const [moves, setMoves] = useState(0);
  
  // Stan informujący o wygranej
  const [isWon, setIsWon] = useState(false);

  /**
   * Funkcja inicjalizująca lub resetująca grę.
   * @param diskCount Liczba krążków do utworzenia.
   */
  const initializeGame = (diskCount: number) => {
    const firstTower: number[] = [];
    // Tworzymy krążki od największego (na dole) do najmniejszego (na górze)
    for (let i = diskCount; i > 0; i--) {
      firstTower.push(i);
    }
    
    // Ustawiamy stan początkowy: wszystkie krążki na pierwszej wieży
    setTowers([firstTower, [], []]);
    setMoves(0);
    setIsWon(false);
    setSelectedTowerIndex(null);
  };

  // Efekt uruchamiany przy pierwszej renderze oraz przy zmianie `numDisks`
  useEffect(() => {
    initializeGame(numDisks);
  }, [numDisks]);

  /**
   * Obsługa kliknięcia na wieżę.
   * @param clickedIndex Indeks klikniętej wieży (0, 1 lub 2).
   */
  const handleTowerClick = (clickedIndex: number) => {
    // Nie rób nic, jeśli gra jest już wygrana
    if (isWon) return;

    if (selectedTowerIndex === null) {
      // --- ETAP 1: Podnoszenie krążka ---
      // Sprawdź, czy kliknięta wieża nie jest pusta
      if (towers[clickedIndex].length > 0) {
        setSelectedTowerIndex(clickedIndex); // "Podnieś" krążek (zaznacz wieżę)
      }
    } else {
      // --- ETAP 2: Upuszczanie krążka ---
      
      // Jeśli kliknięto tę samą wieżę, po prostu odznacz
      if (selectedTowerIndex === clickedIndex) {
        setSelectedTowerIndex(null);
        return;
      }

      // Pobranie danych o wieży źródłowej i docelowej
      const sourceTower = towers[selectedTowerIndex];
      const destTower = towers[clickedIndex];
      
      // Pobranie krążka, który chcemy przenieść (ostatni element tablicy)
      const diskToMove = sourceTower[sourceTower.length - 1];
      
      // Pobranie górnego krążka na wieży docelowej (jeśli istnieje)
      const topDiskOnDest = destTower.length > 0 ? destTower[destTower.length - 1] : null;

      // --- Walidacja ruchu ---
      // Ruch jest dozwolony, jeśli:
      // 1. Wieża docelowa jest pusta (topDiskOnDest === null)
      // 2. Przenoszony krążek jest mniejszy niż górny krążek na wieży docelowej
      if (topDiskOnDest === null || diskToMove < topDiskOnDest) {
        // --- Wykonanie prawidłowego ruchu ---
        
        // Stwórz głęboką kopię stanu wież
        const newTowers = towers.map(tower => [...tower]);
        
        // Usuń krążek z wieży źródłowej
        const disk = newTowers[selectedTowerIndex].pop()!; // Wykrzyknik, bo wiemy, że nie jest pusty
        
        // Dodaj krążek na wieżę docelową
        newTowers[clickedIndex].push(disk);

        // Zaktualizuj stany
        setTowers(newTowers);
        setMoves(moves + 1);
        setSelectedTowerIndex(null); // Zakończ ruch (odznacz)

        // --- Sprawdzenie warunku wygranej ---
        // Wygrana, jeśli wszystkie krążki są na wieży 1 lub 2
        if (newTowers[1].length === numDisks || newTowers[2].length === numDisks) {
          setIsWon(true);
        }
      } else {
        // --- Nieprawidłowy ruch ---
        // Po prostu odznacz wieżę, nie wykonując ruchu
        setSelectedTowerIndex(null);
      }
    }
  };

  /**
   * Obsługa zmiany liczby krążków w inpucie.
   */
  const handleNumDisksChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const count = parseInt(e.target.value, 10);
    // Ustaw limit dla wydajności i sensowności
    if (count > 0 && count <= 10) {
      setNumDisks(count);
    }
  };

  return (
    <div className="hanoi-game">
      <h1>Wieże Hanoi</h1>
      
      <div className="controls">
        <label htmlFor="numDisks">Liczba krążków: </label>
        <input
          type="number"
          id="numDisks"
          min="1"
          max="10"
          value={numDisks}
          onChange={handleNumDisksChange}
        />
        <button onClick={() => initializeGame(numDisks)}>Reset</button>
      </div>

      <div className="info">
        <p>Ruchy: {moves}</p>
        <p>Minimalna liczba ruchów: {Math.pow(2, numDisks) - 1}</p>
      </div>

      {isWon && (
        <div className="win-message">
          <h2>Gratulacje, wygrałeś!</h2>
        </div>
      )}

      <div className="game-board">
        {towers.map((tower, towerIndex) => (
          <div
            key={towerIndex}
            className={`tower ${selectedTowerIndex === towerIndex ? 'selected' : ''}`}
            onClick={() => handleTowerClick(towerIndex)}
          >
            {/* Renderujemy krążki od dołu do góry (dzięki flex-direction: column-reverse w CSS) */}
            {tower.map((diskSize, diskIndex) => {
              // Wierzchni krążek to ten, który faktycznie zostanie przeniesiony
              const isTopDisk = diskIndex === tower.length - 1;
              const isSelected = selectedTowerIndex === towerIndex && isTopDisk;
              return (
              <div
                key={diskSize}
                className={`disk ${isSelected ? 'disk-selected' : ''}`}
                style={{
                  width: `${30 + diskSize * 15}%`, // Szerokość zależna od rozmiaru krążka
                  backgroundColor: `hsl(${diskSize * 40}, 70%, 60%)`, // Kolor zależny od rozmiaru
                }}
              >
                {diskSize}
              </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="info">
        <p><b>Uwaga!</b> Aby wykonać ruch kliknij na prostokąt z którego chcesz zabrać krążek,<br />
        a następnie na ten, do którego chcesz go przesunąć.</p>
      </div>

    </div>
  );
};

export default HanoiGame;