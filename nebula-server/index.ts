

import express, { Request, Response } from 'express';
import cors from 'cors';
import ADODB from 'node-adodb';
import * as dotenv from 'dotenv';

// 1. Caricamento configurazione
dotenv.config();

const app = express();

// Recupero variabili con valori di default
const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DB_PATH || './database.mdb';

// Configurazione Database
const connectionString = `Provider=Microsoft.Jet.OLEDB.4.0;Data Source=${DB_PATH};`;
const db = ADODB.open(connectionString);

// 2. Middleware
app.use(cors());
app.use(express.json());

// --- ENDPOINT (rimangono invariati rispetto ai precedenti) ---

app.get('/api/data/:tableName', async (req: Request, res: Response) => {
  // Rimuove eventuali caratteri strani che non dovrebbero stare in un nome tabella
  const tableName = req.params.tableName.replace(/[^a-zA-Z0-9_]/g, '');

  try
  {
    const query = `SELECT * FROM [${tableName}]`; // Le parentesi quadre aiutano con nomi tabella con spazi
    const data = await db.query(query);
    res.json(data);
  }
  catch (error)
  {
     console.error(error);
    // ... gestione errore
  }
});

app.get('/api/matchlist/:tableName', async (req: Request, res: Response) => {
  // Rimuove eventuali caratteri strani che non dovrebbero stare in un nome tabella
  const tableName = req.params.tableName.replace(/[^a-zA-Z0-9_]/g, '');

  try {
    const query = `SELECT ID, Title, PlayDate FROM [${tableName}]`; // Le parentesi quadre aiutano con nomi tabella con spazi
    const data = await db.query(query);
    res.json(data);
  } catch (error) {
    // ... gestione errore
  }
});

app.get('/api/data/:tableName/:id', async (req: Request, res: Response) => {
  const { tableName, id } = req.params;

  // Controllo sicurezza ID
  if (isNaN(Number(id))) {
    return res.status(400).json({ error: 'ID non valido.' });
  }

  try {
    // Esecuzione query
    const query = `SELECT * FROM [${tableName}] WHERE id = ${id}`;
    const data: any[] = await db.query(query);

    if (data && data.length > 0) {
      const record = data[0];

      // --- LOGICA DI DECODIFICA BLOB/MEMO ---
      if (record.MatchEventsFile && typeof record.MatchEventsFile === 'string') {
        const input = record.MatchEventsFile;

        // Creiamo un buffer grande il doppio della stringa "corrotta"
        // perché ogni carattere visualizzato ne contiene in realtà due originali
        const buffer = Buffer.alloc(input.length * 2);

        for (let i = 0; i < input.length; i++) {
          // Estraiamo il valore numerico del carattere Unicode (es. 12610)
          // e lo scriviamo come coppia di byte (Little Endian)
          buffer.writeUInt16LE(input.charCodeAt(i), i * 2);
        }

        // Ora convertiamo il buffer risultante in stringa leggibile.
        // Proviamo prima UTF-8, rimuovendo eventuali caratteri nulli finali
        let decoded = buffer.toString('utf8').replace(/\0/g, '');

        // Se la stringa sembra ancora vuota o corrotta, proviamo il fallback ASCII
        if (!decoded || decoded.length < 5) {
          decoded = buffer.toString('ascii').replace(/\0/g, '');
        }

        record.MatchEventsFile = decoded;
      }
      // ---------------------------------------
      if (record.MatchDataFile && typeof record.MatchDataFile === 'string') {
        const input = record.MatchDataFile;

        // Creiamo un buffer grande il doppio della stringa "corrotta"
        // perché ogni carattere visualizzato ne contiene in realtà due originali
        const buffer = Buffer.alloc(input.length * 2);

        for (let i = 0; i < input.length; i++) {
          // Estraiamo il valore numerico del carattere Unicode (es. 12610)
          // e lo scriviamo come coppia di byte (Little Endian)
          buffer.writeUInt16LE(input.charCodeAt(i), i * 2);
        }

        // Ora convertiamo il buffer risultante in stringa leggibile.
        // Proviamo prima UTF-8, rimuovendo eventuali caratteri nulli finali
        let decoded = buffer.toString('utf8').replace(/\0/g, '');

        // Se la stringa sembra ancora vuota o corrotta, proviamo il fallback ASCII
        if (!decoded || decoded.length < 5) {
          decoded = buffer.toString('ascii').replace(/\0/g, '');
        }

        record.MatchDataFile = decoded;
      }
      // ---------------------------------------

      res.json(record);
    } else {
      res.status(404).json({ message: 'Record non trovato' });
    }

  } catch (error) {
    console.error(`Errole nel recupero dati per ${tableName} ID ${id}:`, error);
    res.status(500).json({
                           error: 'Errore interno del server',
                           details: error instanceof Error ? error.message : 'Unknown error'
                         });
  }
});

app.get('/api/quarters/:matchid', async (req: Request, res: Response) =>
{
   const mId = req.params.matchid;
   const tableName: string = "Quarter";

   try
   {
      const query = `SELECT * FROM [${tableName}] WHERE LinkMatchHeader = ${mId}`; // Le parentesi quadre aiutano con nomi tabella con spazi
      const data = await db.query(query);
      res.json(data);
   }
   catch (error)
   {
      // ... gestione errore
      console.error(error);
   }
});



// 3. Avvio Server
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(` backend attivo sulla porta: ${PORT}`);
  console.log(` database collegato: ${DB_PATH}`);
  console.log(`=========================================`);
});
