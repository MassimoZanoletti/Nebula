import {
   ChangeDetectorRef,
   Component,
   OnInit} from '@angular/core';
import { NgIf,
   NgFor} from "@angular/common";
import { RouterOutlet } from '@angular/router';
import { DbServService } from "./services/db-serv.service";
import { HttpClient } from "@angular/common/http";
import {
   BehaviorSubject,
   Observable,
   Subscription,
   Subject,
   lastValueFrom } from 'rxjs';
import { BlockUIModule } from "primeng/blockui";
import {
   Button,
   ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { PrimeTemplate } from "primeng/api";
import { ProgressSpinnerModule } from "primeng/progressspinner";
import { TableModule} from "primeng/table";
import { TooltipModule } from "primeng/tooltip";
import { InputTextareaModule } from 'primeng/inputtextarea';
import { FormsModule } from '@angular/forms';
import { XMLParser } from 'fast-xml-parser';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { globs } from "./common/globals";
import { DividerModule } from 'primeng/divider';
import { Chart } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ViewChild } from '@angular/core';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { ChartModule } from 'primeng/chart';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import {TabViewChangeEvent, TabViewModule} from 'primeng/tabview';
import {color} from "chart.js/helpers";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
//


Chart.register(annotationPlugin);
Chart.register(ChartDataLabels);


export type TQuartoGiocato =
{
   titolo: string;
   lineChartData: ChartConfiguration<'line'>['data'];
   lineChartOptions: ChartOptions<'line'>;
   isRegular: boolean;
   numero: number;
   status: number;
   myTeamPunti1: number;
   myTeamPunti2: number;
   oppoTeamPunti1: number;
   oppoTeamPunti2: number;
   duration: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
   imports: [
      NgIf,
      NgFor,
      RouterOutlet,
      Button,
      PrimeTemplate,
      TableModule,
      TooltipModule,
      ButtonModule,
      TooltipModule,
      CardModule,
      ProgressSpinnerModule,
      BlockUIModule,
      InputTextareaModule,
      FormsModule,
      ChartModule,
      BaseChartDirective,
      TabViewModule,
      DividerModule,
   ],
  providers: [provideCharts(withDefaultRegisterables())],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit
{
   @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

   public lineChartData: ChartConfiguration<'line'>['data'] = {
      datasets: [
         {
            label: 'myteam',
            data: [
               { x: 0, y: 0 },
               { x: 2, y: 0.5, player: 'Corti' },
               { x: 5, y: 1.0, player: 'Corti' },
               { x: 7, y: 1.2, player: 'Zanoletti' },
               { x: 7, y: 2.0, player: 'Mosca', errore: 2 },
               { x: 9, y: 2.5 },
               { x: 11, y: 3.5 },
               { x: 13, y: 4.0 },
               { x: 15, y: 4.5 },
               { x: 16, y: 5.0 },
               { x: 17, y: 5.0 },
               { x: 20, y: 5.5 },
               { x: 22, y: 6.0 },
               { x: 25, y: 7.1 },
               { x: 27, y: 7.5 },
               { x: 29, y: 8.5 },
               { x: 29, y: 10 }
            ] as any,
            borderColor: 'rgb(255, 0, 0)',
            stepped: 'after',
            pointRadius: 6,
            pointBackgroundColor: '#ff7777',
            pointBorderWidth: 2,
            pointStyle: (context: any) => {
               const value = context.dataset.data[context.dataIndex] as any;
               return (value?.delta != undefined && value.delta > 0) ? 'circle' : 'cross';
            }
         },
         {
            label: 'oppoteam',
            data: [
               { x: 0, y: 0 },
               { x: 2, y: 2 },
               { x: 5, y: 5.3 },
               { x: 6, y: 7.9 },
               { x: 8, y: 9 },
               { x: 8, y: 10 }
            ],
            borderColor: 'rgb(0, 127, 0)',
            stepped: 'after',
            pointRadius: 6,
            pointStyle: (context: any) => {
               const value = context.dataset.data[context.dataIndex] as any;
               return (value?.delta != undefined && value.delta > 0) ? 'circle' : 'cross';
            }
         },
      ]
   };

   public lineChartOptions: ChartOptions<'line'> = {
      responsive: true,
      indexAxis: 'y', // Mantiene la logica Y per il tempo
      layout: {          // <-- stesso livello di scales e plugins
         padding: {
            left: 20
         }
      },
      scales: {
         x: {
            type: 'linear',
            position: 'top',
            beginAtZero: true,
            min: 0,
            max: 100,
            title: { display: true, text: 'Punti' },
            ticks: {
               stepSize: 1
            }
         },
         y: {
            type: 'linear',
            reverse: true,
            min: 0,
            max: 10,
            title: { display: true, text: 'Minuti di gioco' },
            ticks: {
               stepSize: 1
            }
         }
      },
      plugins: {
         // --- CONFIGURAZIONE DATALABELS ---
         datalabels: {
            backgroundColor: (context) => context.dataset.borderColor as string,
            borderRadius: 4,
            color: (context) => {
               const value = context.dataset.data[context.dataIndex] as any;
               let clr: string = 'white';
               if (value.delta != undefined)
               {
                  if (value.delta == 0)
                     clr = 'black';
               }
               return clr;
            },
            font: {
               weight: 'bold',
               size: 14
            },
            padding: 4,
            // Poiché indexAxis è 'y', la label deve seguire la coordinata X (i punti)
            anchor: 'center',
            align: 'right',
            offset: 8,
            formatter: (value: any) => {
               // Mostriamo il valore X (i punti realizzati)
               let dlt:string = "";
               if (value.delta)
               {
                  if (value.delta == 3)
                     dlt = `{+3️⃣}  ->  `;
                  else if (value.delta == 2)
                     dlt = `{+2️⃣}  ->  `;
                  else if (value.delta == 1)
                     dlt = `{+1️⃣}  ->  `;
               }
               const pl: string = value.player ? `              ${value.player}` : '';
               const tmp: string = value.tempo ? `[${value.tempo}]  ` : "";
               return `${tmp}${dlt}${value.x}${pl}`;
            },
            // Nasconde la label se il valore è 0 (opzionale) o se sono troppo vicine
            display: (context) => {
               return context.active || (context.dataIndex % 1 === 0);
            }
         },
         // --- CONFIGURAZIONE TOOLTIP ---
         tooltip: {
            callbacks: {
               label: (context: any) => `Punti: ${context.raw.x} al minuto ${context.raw.y}`
            }
         },
         // --- CONFIGURAZIONE ANNOTATION ---
         annotation: {
            annotations: {
               fallo1: {
                  type: 'line',
                  yMin: 3.5,
                  yMax: 3.5,
                  borderColor: 'red',
                  borderWidth: 2,
                  borderDash: [5, 5],
                  label: {
                     display: true,
                     content: 'Fallo: Belinelli',
                     position: 'start',
                     backgroundColor: 'orange',
                     font: { size: 14 },
                     xAdjust: 0
                  }
               },
               cambio1: {
                  type: 'label',
                  xValue: 0,
                  yValue: 7,
                  position: { x: 'start', y: 'center' },
                  backgroundColor: '#00ffff',
                  content: '⇄ in Teodosic   ---   out Hackett',
                  font: { size: 14 },
               }
            }
         }
      }
   };

   title = 'nebula';
   tabActiveIndex: number =0;
   partitaOk: boolean = false;

   tooltip_Pir_Title: string  = globs.tooltip_Pir_Title;
   tooltip_Pir_Desc: string   = globs.tooltip_Pir_Desc;
   tooltip_Oer_Title: string  = globs.tooltip_Oer_Title;
   tooltip_Oer_Desc: string   = globs.tooltip_Oer_Desc;
   tooltip_Efgp_Title: string = globs.tooltip_Efgp_Title;
   tooltip_Efgp_Desc: string  = globs.tooltip_Efgp_Desc;
   tooltip_Tsp_Title: string  = globs.tooltip_Tsp_Title;
   tooltip_Tsp_Desc: string   = globs.tooltip_Tsp_Desc;

   matchList: Array<any> = [];
   eventsData: string = "";
   xmlData: string = "";
   quarti: Array<any> = [];
   quartiGiocati: Array<TQuartoGiocato> = [];
   dbJson: any = {};
   jsonDataStr: string = "";
   jsonData: any = {};
   myPlayers: any = [];
   oppoPlayers: any = [];


   constructor (private dbServ: DbServService,
                private cdr: ChangeDetectorRef,
                public sanitizer: DomSanitizer)
   {}


   async ngOnInit()
   {
      let response: any;

      response = await lastValueFrom(this.dbServ.GetMatchHeaderList());
      if (response)
      {
         this.matchList = response;
         this.matchList.reverse();  // per avere in ordine inverso l'elenco delle partite
         this.cdr.detectChanges();
      }
   }


   async HandleTabChange (event: TabViewChangeEvent)
   {
      this.tabActiveIndex = event.index;
   }


   async BtnSelezionaMatch (item: any)
   {
      let response: any;
      let respQuarti: any;

      this.partitaOk = false;
      //
      respQuarti = await lastValueFrom(this.dbServ.GetMatchQuarters(item.ID));
      if (respQuarti)
      {
         this.quarti = respQuarti;
      }
      //
      try
      {
         response = await lastValueFrom(this.dbServ.GetMatchHeader(item.ID));
      }
      catch (e)
      {
         response = null;
         console.error ("Exception getting data from server");
         console.error (e);
      }
      if (response)
      {
         this.eventsData = response.MatchEventsFile;
         this.xmlData = response.MatchDataFile;
         this.dbJson = await this.xmlToJsonStr(this.xmlData);
         this.jsonData = {
            match: {
               parziali: ["","","","","","","",""],
               progressivi: ["","","","","","","",""],
               title: response.Title,
               number: response.Number,
               playDate: response.PlayDate,
               home: response.Home,
               referee1: response.Referee1,
               referee2: response.Referee2,
               giornata: response.Day,
               location: response.Location
            },
            myTeam: {
               name:            this.dbJson.BasketScoutDreamEVODataFile.Match.MyTeam.Name,
               dati:            {
                  pPerse:      this.dbJson.BasketScoutDreamEVODataFile.Match.MyTeam.Dati.PPerse,
                  pRecuperate: this.dbJson.BasketScoutDreamEVODataFile.Match.MyTeam.Dati.Precuperate,
                  rimbDifesa:  this.dbJson.BasketScoutDreamEVODataFile.Match.MyTeam.Dati.RimbDifesa,
                  rimbAttacco: this.dbJson.BasketScoutDreamEVODataFile.Match.MyTeam.Dati.RimbAttacco
               },
               timeouts:        {
                  primoTempo:   [],
                  secondoTempo: [],
                  extraTime:    []
               },
               quintettoQuarto: [],
               players:         [],
               coach1:          "",
               coach2:          "",
               totali:          {
                  punti:       0,
                  tempoGioco:  0,
                  min:         "n.e.",
                  tl:          "",
                  t2:          "",
                  t3:          "",
                  tdc:         "",
                  fFatti:      0,
                  fSubiti:     0,
                  rDif:        0,
                  rAtt:        0,
                  rTot:        0,
                  pPerse:      0,
                  pRecuperate: 0,
                  assist:      0,
                  stopFatte:   0,
                  stopSubite:  0,
                  plusMinus:   0,
                  pir:         0,
                  oer:         0,
                  oerStr:      "",
                  eFGp:        0,
                  eFGpStr:     "",
                  TSp:         0,
                  TSpStr:      "",
                  q1:          {
                     punti: 0,
                     min:   0,
                     dato:  ""
                  },
                  q2:          {
                     punti: 0,
                     min:   0,
                     dato:  ""
                  },
                  q3:          {
                     punti: 0,
                     min:   0,
                     dato:  ""
                  },
                  q4:          {
                     punti: 0,
                     min:   0,
                     dato:  ""
                  },
                  et:          {
                     punti: 0,
                     min:   0,
                     dato:  ""
                  }
               }
            },
            oppoTeam: {
               name: this.dbJson.BasketScoutDreamEVODataFile.Match.OpponentTeam.Name,
               dati: {
                  pPerse: this.dbJson.BasketScoutDreamEVODataFile.Match.OpponentTeam.Dati.PPerse,
                  pRecuperate: this.dbJson.BasketScoutDreamEVODataFile.Match.OpponentTeam.Dati.Precuperate,
                  rimbDifesa: this.dbJson.BasketScoutDreamEVODataFile.Match.OpponentTeam.Dati.RimbDifesa,
                  rimbAttacco: this.dbJson.BasketScoutDreamEVODataFile.Match.OpponentTeam.Dati.RimbAttacco
               },
               timeouts: {
                  primoTempo: [],
                  secondoTempo: [],
                  extraTime: []
               },
               quintettoQuarto: [],
               players: [],
               coach1:          "",
               coach2:          "",
               totali: {
                  punti:       0,
                  tempoGioco:  0,
                  min:         "n.e.",
                  tl:          "",
                  t2:          "",
                  t3:          "",
                  tdc:         "",
                  fFatti:      0,
                  fSubiti:     0,
                  rDif:        0,
                  rAtt:        0,
                  rTot:        0,
                  pPerse:      0,
                  pRecuperate: 0,
                  assist:      0,
                  stopFatte:   0,
                  stopSubite:  0,
                  plusMinus:   0,
                  pir:         0,
                  oer:         0,
                  oerStr:      "",
                  eFGp:        0,
                  eFGpStr:     "",
                  TSp:         0,
                  TSpStr:      "",
                  q1:          {
                     punti: 0,
                     min:   0,
                     dato:  ""
                  },
                  q2:          {
                     punti: 0,
                     min:   0,
                     dato:  ""
                  },
                  q3:          {
                     punti: 0,
                     min:   0,
                     dato:  ""
                  },
                  q4:          {
                     punti: 0,
                     min:   0,
                     dato:  ""
                  },
                  et:          {
                     punti: 0,
                     min:   0,
                     dato:  ""
                  }
               }
            },
         }
         //
         // MyTeam
         this.jsonData.myTeam.coach1 = response.MyCoach1;
         this.jsonData.myTeam.coach2 = response.MyCoach2;
         this.jsonData.myTeam.timeouts.primoTempo.push(this.dbJson.BasketScoutDreamEVODataFile.Match.MyTeam.Timeouts.node_1Tempo.node_1);
         this.jsonData.myTeam.timeouts.primoTempo.push(this.dbJson.BasketScoutDreamEVODataFile.Match.MyTeam.Timeouts.node_1Tempo.node_2);
         this.jsonData.myTeam.timeouts.secondoTempo.push(this.dbJson.BasketScoutDreamEVODataFile.Match.MyTeam.Timeouts.node_2Tempo.node_1);
         this.jsonData.myTeam.timeouts.secondoTempo.push(this.dbJson.BasketScoutDreamEVODataFile.Match.MyTeam.Timeouts.node_2Tempo.node_2);
         this.jsonData.myTeam.timeouts.secondoTempo.push(this.dbJson.BasketScoutDreamEVODataFile.Match.MyTeam.Timeouts.node_2Tempo.node_3);
         this.jsonData.myTeam.timeouts.extraTime.push(this.dbJson.BasketScoutDreamEVODataFile.Match.MyTeam.Timeouts.Extra.node_1);
         this.jsonData.myTeam.timeouts.extraTime.push(this.dbJson.BasketScoutDreamEVODataFile.Match.MyTeam.Timeouts.Extra.node_2);
         this.jsonData.myTeam.timeouts.extraTime.push(this.dbJson.BasketScoutDreamEVODataFile.Match.MyTeam.Timeouts.Extra.node_3);
         this.jsonData.myTeam.timeouts.extraTime.push(this.dbJson.BasketScoutDreamEVODataFile.Match.MyTeam.Timeouts.Extra.node_4);
         //
         this.jsonData.myTeam.quintettoQuarto.push(this.dbJson.BasketScoutDreamEVODataFile.Match.MyTeam.Quintetto1);
         this.jsonData.myTeam.quintettoQuarto.push(this.dbJson.BasketScoutDreamEVODataFile.Match.MyTeam.Quintetto2);
         this.jsonData.myTeam.quintettoQuarto.push(this.dbJson.BasketScoutDreamEVODataFile.Match.MyTeam.Quintetto3);
         this.jsonData.myTeam.quintettoQuarto.push(this.dbJson.BasketScoutDreamEVODataFile.Match.MyTeam.Quintetto4);
         this.jsonData.myTeam.quintettoQuarto.push(this.dbJson.BasketScoutDreamEVODataFile.Match.MyTeam.Quintetto5);
         this.jsonData.myTeam.quintettoQuarto.push(this.dbJson.BasketScoutDreamEVODataFile.Match.MyTeam.Quintetto6);
         this.jsonData.myTeam.quintettoQuarto.push(this.dbJson.BasketScoutDreamEVODataFile.Match.MyTeam.Quintetto7);
         this.jsonData.myTeam.quintettoQuarto.push(this.dbJson.BasketScoutDreamEVODataFile.Match.MyTeam.Quintetto8);
         //
         if (this.dbJson.BasketScoutDreamEVODataFile.Match.MyTeam.Player1)
            this.jsonData.myTeam.players.push(await this.ExtractPlayer (this.dbJson.BasketScoutDreamEVODataFile.Match.MyTeam.Player1[0], true));
         if (this.dbJson.BasketScoutDreamEVODataFile.Match.MyTeam.Player2)
            this.jsonData.myTeam.players.push(await this.ExtractPlayer (this.dbJson.BasketScoutDreamEVODataFile.Match.MyTeam.Player2[0], true));
         if (this.dbJson.BasketScoutDreamEVODataFile.Match.MyTeam.Player3)
            this.jsonData.myTeam.players.push(await this.ExtractPlayer (this.dbJson.BasketScoutDreamEVODataFile.Match.MyTeam.Player3[0], true));
         if (this.dbJson.BasketScoutDreamEVODataFile.Match.MyTeam.Player4)
            this.jsonData.myTeam.players.push(await this.ExtractPlayer (this.dbJson.BasketScoutDreamEVODataFile.Match.MyTeam.Player4[0], true));
         if (this.dbJson.BasketScoutDreamEVODataFile.Match.MyTeam.Player5)
            this.jsonData.myTeam.players.push(await this.ExtractPlayer (this.dbJson.BasketScoutDreamEVODataFile.Match.MyTeam.Player5[0], true));
         if (this.dbJson.BasketScoutDreamEVODataFile.Match.MyTeam.Player6)
            this.jsonData.myTeam.players.push(await this.ExtractPlayer (this.dbJson.BasketScoutDreamEVODataFile.Match.MyTeam.Player6[0], true));
         if (this.dbJson.BasketScoutDreamEVODataFile.Match.MyTeam.Player7)
            this.jsonData.myTeam.players.push(await this.ExtractPlayer (this.dbJson.BasketScoutDreamEVODataFile.Match.MyTeam.Player7[0], true));
         if (this.dbJson.BasketScoutDreamEVODataFile.Match.MyTeam.Player8)
            this.jsonData.myTeam.players.push(await this.ExtractPlayer (this.dbJson.BasketScoutDreamEVODataFile.Match.MyTeam.Player8[0], true));
         if (this.dbJson.BasketScoutDreamEVODataFile.Match.MyTeam.Player9)
            this.jsonData.myTeam.players.push(await this.ExtractPlayer (this.dbJson.BasketScoutDreamEVODataFile.Match.MyTeam.Player9[0], true));
         if (this.dbJson.BasketScoutDreamEVODataFile.Match.MyTeam.Player10)
            this.jsonData.myTeam.players.push(await this.ExtractPlayer (this.dbJson.BasketScoutDreamEVODataFile.Match.MyTeam.Player10[0], true));
         if (this.dbJson.BasketScoutDreamEVODataFile.Match.MyTeam.Player11)
            this.jsonData.myTeam.players.push(await this.ExtractPlayer (this.dbJson.BasketScoutDreamEVODataFile.Match.MyTeam.Player11[0], true));
         if (this.dbJson.BasketScoutDreamEVODataFile.Match.MyTeam.Player12)
            this.jsonData.myTeam.players.push(await this.ExtractPlayer (this.dbJson.BasketScoutDreamEVODataFile.Match.MyTeam.Player12[0], true));
         //
         // OpponentTeam
         this.jsonData.oppoTeam.coach1 = response.OppCoach1;
         this.jsonData.oppoTeam.coach2 = response.OppCoach2;
         this.jsonData.oppoTeam.timeouts.primoTempo.push(this.dbJson.BasketScoutDreamEVODataFile.Match.OpponentTeam.Timeouts.node_1Tempo.node_1);
         this.jsonData.oppoTeam.timeouts.primoTempo.push(this.dbJson.BasketScoutDreamEVODataFile.Match.OpponentTeam.Timeouts.node_1Tempo.node_2);
         this.jsonData.oppoTeam.timeouts.secondoTempo.push(this.dbJson.BasketScoutDreamEVODataFile.Match.OpponentTeam.Timeouts.node_2Tempo.node_1);
         this.jsonData.oppoTeam.timeouts.secondoTempo.push(this.dbJson.BasketScoutDreamEVODataFile.Match.OpponentTeam.Timeouts.node_2Tempo.node_2);
         this.jsonData.oppoTeam.timeouts.secondoTempo.push(this.dbJson.BasketScoutDreamEVODataFile.Match.OpponentTeam.Timeouts.node_2Tempo.node_3);
         this.jsonData.oppoTeam.timeouts.extraTime.push(this.dbJson.BasketScoutDreamEVODataFile.Match.OpponentTeam.Timeouts.Extra.node_1);
         this.jsonData.oppoTeam.timeouts.extraTime.push(this.dbJson.BasketScoutDreamEVODataFile.Match.OpponentTeam.Timeouts.Extra.node_2);
         this.jsonData.oppoTeam.timeouts.extraTime.push(this.dbJson.BasketScoutDreamEVODataFile.Match.OpponentTeam.Timeouts.Extra.node_3);
         this.jsonData.oppoTeam.timeouts.extraTime.push(this.dbJson.BasketScoutDreamEVODataFile.Match.OpponentTeam.Timeouts.Extra.node_4);
         //
         this.jsonData.oppoTeam.quintettoQuarto.push(this.dbJson.BasketScoutDreamEVODataFile.Match.OpponentTeam.Quintetto1);
         this.jsonData.oppoTeam.quintettoQuarto.push(this.dbJson.BasketScoutDreamEVODataFile.Match.OpponentTeam.Quintetto2);
         this.jsonData.oppoTeam.quintettoQuarto.push(this.dbJson.BasketScoutDreamEVODataFile.Match.OpponentTeam.Quintetto3);
         this.jsonData.oppoTeam.quintettoQuarto.push(this.dbJson.BasketScoutDreamEVODataFile.Match.OpponentTeam.Quintetto4);
         this.jsonData.oppoTeam.quintettoQuarto.push(this.dbJson.BasketScoutDreamEVODataFile.Match.OpponentTeam.Quintetto5);
         this.jsonData.oppoTeam.quintettoQuarto.push(this.dbJson.BasketScoutDreamEVODataFile.Match.OpponentTeam.Quintetto6);
         this.jsonData.oppoTeam.quintettoQuarto.push(this.dbJson.BasketScoutDreamEVODataFile.Match.OpponentTeam.Quintetto7);
         this.jsonData.oppoTeam.quintettoQuarto.push(this.dbJson.BasketScoutDreamEVODataFile.Match.OpponentTeam.Quintetto8);
         //
         if (this.dbJson.BasketScoutDreamEVODataFile.Match.OpponentTeam.Player1)
            this.jsonData.oppoTeam.players.push(await this.ExtractPlayer (this.dbJson.BasketScoutDreamEVODataFile.Match.OpponentTeam.Player1[0], false));
         if (this.dbJson.BasketScoutDreamEVODataFile.Match.OpponentTeam.Player2)
            this.jsonData.oppoTeam.players.push(await this.ExtractPlayer (this.dbJson.BasketScoutDreamEVODataFile.Match.OpponentTeam.Player2[0], false));
         if (this.dbJson.BasketScoutDreamEVODataFile.Match.OpponentTeam.Player3)
            this.jsonData.oppoTeam.players.push(await this.ExtractPlayer (this.dbJson.BasketScoutDreamEVODataFile.Match.OpponentTeam.Player3[0], false));
         if (this.dbJson.BasketScoutDreamEVODataFile.Match.OpponentTeam.Player4)
            this.jsonData.oppoTeam.players.push(await this.ExtractPlayer (this.dbJson.BasketScoutDreamEVODataFile.Match.OpponentTeam.Player4[0], false));
         if (this.dbJson.BasketScoutDreamEVODataFile.Match.OpponentTeam.Player5)
            this.jsonData.oppoTeam.players.push(await this.ExtractPlayer (this.dbJson.BasketScoutDreamEVODataFile.Match.OpponentTeam.Player5[0], false));
         if (this.dbJson.BasketScoutDreamEVODataFile.Match.OpponentTeam.Player6)
            this.jsonData.oppoTeam.players.push(await this.ExtractPlayer (this.dbJson.BasketScoutDreamEVODataFile.Match.OpponentTeam.Player6[0], false));
         if (this.dbJson.BasketScoutDreamEVODataFile.Match.OpponentTeam.Player7)
            this.jsonData.oppoTeam.players.push(await this.ExtractPlayer (this.dbJson.BasketScoutDreamEVODataFile.Match.OpponentTeam.Player7[0], false));
         if (this.dbJson.BasketScoutDreamEVODataFile.Match.OpponentTeam.Player8)
            this.jsonData.oppoTeam.players.push(await this.ExtractPlayer (this.dbJson.BasketScoutDreamEVODataFile.Match.OpponentTeam.Player8[0], false));
         if (this.dbJson.BasketScoutDreamEVODataFile.Match.OpponentTeam.Player9)
            this.jsonData.oppoTeam.players.push(await this.ExtractPlayer (this.dbJson.BasketScoutDreamEVODataFile.Match.OpponentTeam.Player9[0], false));
         if (this.dbJson.BasketScoutDreamEVODataFile.Match.OpponentTeam.Player10)
            this.jsonData.oppoTeam.players.push(await this.ExtractPlayer (this.dbJson.BasketScoutDreamEVODataFile.Match.OpponentTeam.Player10[0], false));
         if (this.dbJson.BasketScoutDreamEVODataFile.Match.OpponentTeam.Player11)
            this.jsonData.oppoTeam.players.push(await this.ExtractPlayer (this.dbJson.BasketScoutDreamEVODataFile.Match.OpponentTeam.Player11[0], false));
         if (this.dbJson.BasketScoutDreamEVODataFile.Match.OpponentTeam.Player12)
            this.jsonData.oppoTeam.players.push(await this.ExtractPlayer (this.dbJson.BasketScoutDreamEVODataFile.Match.OpponentTeam.Player12[0], false));
         //
         // Tempi di gioco nei quarti
         for (let i=0;   i<this.quarti.length;   i++)
         {
            if (this.quarti[i].Status > 1)
               await this.aaaa (true, i+1);
         }
         //
         // Totali MyTeam
         let totGioc: number = 0;
         for (let i=0;   i<this.jsonData.myTeam.players.length;   i++)
         {
            if ((this.jsonData.myTeam.players[i].totali.min != "") && (this.jsonData.myTeam.players[i].totali.min != "n.e."))
               totGioc++;
         }
         let tlF: number = 0;
         let tlR: number = 0;
         let t2F: number = 0;
         let t2R: number = 0;
         let t3F: number = 0;
         let t3R: number = 0;
         let tcF: number = 0;
         let tcR: number = 0;
         for (let i=0;   i<this.jsonData.myTeam.players.length;   i++)
         {
            if ((this.jsonData.myTeam.players[i].totali.min != "") && (this.jsonData.myTeam.players[i].totali.min != "n.e."))
            {
               this.jsonData.myTeam.totali.punti += this.jsonData.myTeam.players[i].totali.punti;
               this.jsonData.myTeam.totali.tempoGioco += this.jsonData.myTeam.players[i].tempoGioco;
               this.jsonData.myTeam.totali.fFatti += this.jsonData.myTeam.players[i].totali.fFatti;
               this.jsonData.myTeam.totali.fSubiti += this.jsonData.myTeam.players[i].totali.fSubiti;
               this.jsonData.myTeam.totali.rDif += this.jsonData.myTeam.players[i].totali.rDif;
               this.jsonData.myTeam.totali.rAtt += this.jsonData.myTeam.players[i].totali.rAtt;
               this.jsonData.myTeam.totali.rTot += this.jsonData.myTeam.players[i].totali.rTot;
               this.jsonData.myTeam.totali.pPerse += this.jsonData.myTeam.players[i].totali.pPerse;
               this.jsonData.myTeam.totali.pRecuperate += this.jsonData.myTeam.players[i].totali.pRecuperate;
               this.jsonData.myTeam.totali.assist += this.jsonData.myTeam.players[i].totali.assist;
               this.jsonData.myTeam.totali.stopFatte += this.jsonData.myTeam.players[i].totali.stopFatte;
               this.jsonData.myTeam.totali.stopSubite += this.jsonData.myTeam.players[i].totali.stopSubite;
               this.jsonData.myTeam.totali.pir += this.jsonData.myTeam.players[i].totali.pir;
               this.jsonData.myTeam.totali.oer += this.jsonData.myTeam.players[i].totali.oer;
               this.jsonData.myTeam.totali.eFGp += this.jsonData.myTeam.players[i].totali.eFGp;
               this.jsonData.myTeam.totali.TSp += this.jsonData.myTeam.players[i].totali.TSp;
               tlF += this.jsonData.myTeam.players[i].totali.tlF;
               tlR += this.jsonData.myTeam.players[i].totali.tlR;
               t2F += this.jsonData.myTeam.players[i].totali.t2F;
               t2R += this.jsonData.myTeam.players[i].totali.t2R;
               t3F += this.jsonData.myTeam.players[i].totali.t3F;
               t3R += this.jsonData.myTeam.players[i].totali.t3R;
               tcF += this.jsonData.myTeam.players[i].totali.tcF;
               tcR += this.jsonData.myTeam.players[i].totali.tcR;
               this.jsonData.myTeam.totali.q1.punti += this.jsonData.myTeam.players[i].totali.q1.punti;
               this.jsonData.myTeam.totali.q1.min += this.jsonData.myTeam.players[i].totali.q1.min;
               this.jsonData.myTeam.totali.q2.punti += this.jsonData.myTeam.players[i].totali.q2.punti;
               this.jsonData.myTeam.totali.q2.min += this.jsonData.myTeam.players[i].totali.q2.min;
               this.jsonData.myTeam.totali.q3.punti += this.jsonData.myTeam.players[i].totali.q3.punti;
               this.jsonData.myTeam.totali.q3.min += this.jsonData.myTeam.players[i].totali.q3.min;
               this.jsonData.myTeam.totali.q4.punti += this.jsonData.myTeam.players[i].totali.q4.punti;
               this.jsonData.myTeam.totali.q4.min += this.jsonData.myTeam.players[i].totali.q4.min;
               this.jsonData.myTeam.totali.et.punti += this.jsonData.myTeam.players[i].totali.et.punti;
               this.jsonData.myTeam.totali.et.min += this.jsonData.myTeam.players[i].totali.et.min;
            }
         }
         this.jsonData.myTeam.totali.oerStr = this.jsonData.myTeam.totali.oer/totGioc;
         this.jsonData.myTeam.totali.eFGpStr = Math.round(this.jsonData.myTeam.totali.eFGp/totGioc).toString();
         this.jsonData.myTeam.totali.TSpStr = Math.round(this.jsonData.myTeam.totali.TSp/totGioc).toString();
         if (tlF > 0)
            this.jsonData.myTeam.totali.tl = `<b>${tlR}/${tlF}</b><br><span style="font-size: 0.90rem;">(${Math.trunc(100*tlR/tlF)}%)</span>`;
         if (t2F > 0)
            this.jsonData.myTeam.totali.t2 = `<b>${t2R}/${t2F}</b><br><span style="font-size: 0.90rem;">(${Math.trunc(100*t2R/t2F)}%)</span>`;
         if (t3F > 0)
            this.jsonData.myTeam.totali.t3 = `<b>${t3R}/${t3F}</b><br><span style="font-size: 0.90rem;">(${Math.trunc(100*t3R/t3F)}%)</span>`;
         if (tcF > 0)
            this.jsonData.myTeam.totali.tc = `<b>${tcR}/${tcF}</b><br><span style="font-size: 0.90rem;">(${Math.trunc(100*tcR/tcF)}%)</span>`;
         if (this.jsonData.myTeam.totali.q1.min > 0)
            this.jsonData.myTeam.totali.q1.dato = `${this.jsonData.myTeam.totali.q1.punti}`;
         if (this.jsonData.myTeam.totali.q2.min > 0)
            this.jsonData.myTeam.totali.q2.dato = `${this.jsonData.myTeam.totali.q2.punti}`;
         if (this.jsonData.myTeam.totali.q3.min > 0)
            this.jsonData.myTeam.totali.q3.dato = `${this.jsonData.myTeam.totali.q3.punti}`;
         if (this.jsonData.myTeam.totali.q4.min > 0)
            this.jsonData.myTeam.totali.q4.dato = `${this.jsonData.myTeam.totali.q4.punti}`;
         if (this.jsonData.myTeam.totali.et.min > 0)
            this.jsonData.myTeam.totali.et.dato = `${this.jsonData.myTeam.totali.et.punti}`;
         // aggiungo i dati di squadra
         this.jsonData.myTeam.totali.pPerse += this.jsonData.myTeam.dati.pPerse;
         this.jsonData.myTeam.totali.pRecuperate += this.jsonData.myTeam.dati.pRecuperate;
         this.jsonData.myTeam.totali.rDif += this.jsonData.myTeam.dati.rimbDifesa;
         this.jsonData.myTeam.totali.rAtt += this.jsonData.myTeam.dati.rimbAttacco;
         this.jsonData.myTeam.totali.rTot = this.jsonData.myTeam.totali.rDif + this.jsonData.myTeam.totali.rAtt;
         //
         // Totali OpponentTeam
         totGioc = 0;
         for (let i=0;   i<this.jsonData.oppoTeam.players.length;   i++)
         {
            if ((this.jsonData.oppoTeam.players[i].totali.min != "") && (this.jsonData.oppoTeam.players[i].totali.min != "n.e."))
               totGioc++;
         }
         tlF = 0;
         tlR = 0;
         t2F = 0;
         t2R = 0;
         t3F = 0;
         t3R = 0;
         tcF = 0;
         tcR = 0;
         for (let i=0;   i<this.jsonData.oppoTeam.players.length;   i++)
         {
            if (this.jsonData.oppoTeam.players[i].totali.min == "n.e.")
               this.jsonData.oppoTeam.players[i].totali.min = "00:00";
            if ((this.jsonData.oppoTeam.players[i].totali.min != "") && (this.jsonData.oppoTeam.players[i].totali.min != "n.e."))
            {
               this.jsonData.oppoTeam.totali.punti += this.jsonData.oppoTeam.players[i].totali.punti;
               this.jsonData.oppoTeam.totali.tempoGioco += this.jsonData.oppoTeam.players[i].tempoGioco;
               this.jsonData.oppoTeam.totali.fFatti += this.jsonData.oppoTeam.players[i].totali.fFatti;
               this.jsonData.oppoTeam.totali.fSubiti += this.jsonData.oppoTeam.players[i].totali.fSubiti;
               this.jsonData.oppoTeam.totali.rDif += this.jsonData.oppoTeam.players[i].totali.rDif;
               this.jsonData.oppoTeam.totali.rAtt += this.jsonData.oppoTeam.players[i].totali.rAtt;
               this.jsonData.oppoTeam.totali.rTot += this.jsonData.oppoTeam.players[i].totali.rTot;
               this.jsonData.oppoTeam.totali.pPerse += this.jsonData.oppoTeam.players[i].totali.pPerse;
               this.jsonData.oppoTeam.totali.pRecuperate += this.jsonData.oppoTeam.players[i].totali.pRecuperate;
               this.jsonData.oppoTeam.totali.assist += this.jsonData.oppoTeam.players[i].totali.assist;
               this.jsonData.oppoTeam.totali.stopFatte += this.jsonData.oppoTeam.players[i].totali.stopFatte;
               this.jsonData.oppoTeam.totali.stopSubite += this.jsonData.oppoTeam.players[i].totali.stopSubite;
               this.jsonData.oppoTeam.totali.pir += this.jsonData.oppoTeam.players[i].totali.pir;
               this.jsonData.oppoTeam.totali.oer += this.jsonData.oppoTeam.players[i].totali.oer;
               this.jsonData.oppoTeam.totali.eFGp += this.jsonData.oppoTeam.players[i].totali.eFGp;
               this.jsonData.oppoTeam.totali.TSp += this.jsonData.oppoTeam.players[i].totali.TSp;
               tlF += this.jsonData.oppoTeam.players[i].totali.tlF;
               tlR += this.jsonData.oppoTeam.players[i].totali.tlR;
               t2F += this.jsonData.oppoTeam.players[i].totali.t2F;
               t2R += this.jsonData.oppoTeam.players[i].totali.t2R;
               t3F += this.jsonData.oppoTeam.players[i].totali.t3F;
               t3R += this.jsonData.oppoTeam.players[i].totali.t3R;
               tcF += this.jsonData.oppoTeam.players[i].totali.tcF;
               tcR += this.jsonData.oppoTeam.players[i].totali.tcR;
               this.jsonData.oppoTeam.totali.q1.punti += this.jsonData.oppoTeam.players[i].totali.q1.punti;
               this.jsonData.oppoTeam.totali.q1.min += this.jsonData.oppoTeam.players[i].totali.q1.min;
               this.jsonData.oppoTeam.totali.q2.punti += this.jsonData.oppoTeam.players[i].totali.q2.punti;
               this.jsonData.oppoTeam.totali.q2.min += this.jsonData.oppoTeam.players[i].totali.q2.min;
               this.jsonData.oppoTeam.totali.q3.punti += this.jsonData.oppoTeam.players[i].totali.q3.punti;
               this.jsonData.oppoTeam.totali.q3.min += this.jsonData.oppoTeam.players[i].totali.q3.min;
               this.jsonData.oppoTeam.totali.q4.punti += this.jsonData.oppoTeam.players[i].totali.q4.punti;
               this.jsonData.oppoTeam.totali.q4.min += this.jsonData.oppoTeam.players[i].totali.q4.min;
               this.jsonData.oppoTeam.totali.et.punti += this.jsonData.oppoTeam.players[i].totali.et.punti;
               this.jsonData.oppoTeam.totali.et.min += this.jsonData.oppoTeam.players[i].totali.et.min;
            }
            if (this.quarti[0].Status > 1)
               this.jsonData.oppoTeam.players[i].totali.q1.dato = `${this.jsonData.oppoTeam.players[i].totali.q1.punti}`;
            if (this.quarti[1].Status > 1)
               this.jsonData.oppoTeam.players[i].totali.q2.dato = `${this.jsonData.oppoTeam.players[i].totali.q2.punti}`;
            if (this.quarti[2].Status > 1)
               this.jsonData.oppoTeam.players[i].totali.q3.dato = `${this.jsonData.oppoTeam.players[i].totali.q3.punti}`;
            if (this.quarti[3].Status > 1)
               this.jsonData.oppoTeam.players[i].totali.q4.dato = `${this.jsonData.oppoTeam.players[i].totali.q4.punti}`;
            if (this.quarti[4].Status > 1)
               this.jsonData.oppoTeam.players[i].totali.et.dato = `${this.jsonData.oppoTeam.players[i].totali.et.punti}`;
         }
         this.jsonData.oppoTeam.totali.oerStr = this.jsonData.oppoTeam.totali.oer/totGioc;
         this.jsonData.oppoTeam.totali.eFGpStr = Math.round(this.jsonData.oppoTeam.totali.eFGp/totGioc).toString();
         this.jsonData.oppoTeam.totali.TSpStr = Math.round(this.jsonData.oppoTeam.totali.TSp/totGioc).toString();
         if (tlF > 0)
            this.jsonData.oppoTeam.totali.tl = `<b>${tlR}/${tlF}</b><br><span style="font-size: 0.90rem;">(${Math.trunc(100*tlR/tlF)}%)</span>`;
         if (t2F > 0)
            this.jsonData.oppoTeam.totali.t2 = `<b>${t2R}/${t2F}</b><br><span style="font-size: 0.90rem;">(${Math.trunc(100*t2R/t2F)}%)</span>`;
         if (t3F > 0)
            this.jsonData.oppoTeam.totali.t3 = `<b>${t3R}/${t3F}</b><br><span style="font-size: 0.90rem;">(${Math.trunc(100*t3R/t3F)}%)</span>`;
         if (tcF > 0)
            this.jsonData.oppoTeam.totali.tc = `<b>${tcR}/${tcF}</b><br><span style="font-size: 0.90rem;">(${Math.trunc(100*tcR/tcF)}%)</span>`;
         if (this.quarti[0].Status > 1)
            this.jsonData.oppoTeam.totali.q1.dato = `${this.jsonData.oppoTeam.totali.q1.punti}`;
         if (this.quarti[1].Status > 1)
            this.jsonData.oppoTeam.totali.q2.dato = `${this.jsonData.oppoTeam.totali.q2.punti}`;
         if (this.quarti[2].Status > 1)
            this.jsonData.oppoTeam.totali.q3.dato = `${this.jsonData.oppoTeam.totali.q3.punti}`;
         if (this.quarti[3].Status > 1)
            this.jsonData.oppoTeam.totali.q4.dato = `${this.jsonData.oppoTeam.totali.q4.punti}`;
         if (this.quarti[4].Status > 1)
            this.jsonData.oppoTeam.totali.et.dato = `${this.jsonData.oppoTeam.totali.et.punti}`;
         // aggiungo i dati di squadra
         this.jsonData.oppoTeam.totali.pPerse += this.jsonData.oppoTeam.dati.pPerse;
         this.jsonData.oppoTeam.totali.pRecuperate += this.jsonData.oppoTeam.dati.pRecuperate;
         this.jsonData.oppoTeam.totali.rDif += this.jsonData.oppoTeam.dati.rimbDifesa;
         this.jsonData.oppoTeam.totali.rAtt += this.jsonData.oppoTeam.dati.rimbAttacco;
         this.jsonData.oppoTeam.totali.rTot = this.jsonData.oppoTeam.totali.rDif + this.jsonData.oppoTeam.totali.rAtt;
         // Calcolo parziali e progressivi
         let mtcp: number = 0;
         let otcp: number = 0;
         for (let i=0;   i<this.quarti.length;   i++)
         {
            if (this.quarti[i].Status > 0)
            {
               mtcp += this.quarti[i].MyTeamCurrPoint;
               otcp += this.quarti[i].OppTeamCurrPoint;
               this.jsonData.match.parziali[i] = `${this.quarti[i].MyTeamCurrPoint} - ${this.quarti[i].OppTeamCurrPoint}`;
               this.jsonData.match.progressivi[i] = `${mtcp} - ${otcp}`;
            }
            else
            {
               this.jsonData.match.parziali[i] = ``;
               this.jsonData.match.progressivi[i] = ``;
            }
         }
         //
         //
         this.jsonDataStr = JSON.stringify(this.jsonData, null, 3);
         this.myPlayers = this.jsonData.myTeam.players;
         this.oppoPlayers = this.jsonData.oppoTeam.players;
         this.cdr.detectChanges();
         this.partitaOk = true;
         this.tabActiveIndex = 1;
         //
         //
         if (respQuarti)
         {
            let myTeamPti: number = 0;
            let oppoTeamPti: number = 0;
            this.quartiGiocati = [];
            for (let i=0;   i<this.quarti.length;   i++)
            {
               if (this.quarti[i].Status > 0)
               {
                  this.quartiGiocati.push (
                     {
                        titolo: (i < 4) ? `Quarto ${i + 1}` : `Supplem. ${i - 3}`,
                        isRegular: (i < 4),
                        numero: i+1,
                        status: this.quarti[i].Status,
                        duration: (i < 4) ? 600 : 300,
                        myTeamPunti1: myTeamPti,
                        oppoTeamPunti1: oppoTeamPti,
                        myTeamPunti2: myTeamPti+this.quarti[i].MyTeamCurrPoint,
                        oppoTeamPunti2: oppoTeamPti+this.quarti[i].OppTeamCurrPoint,
                        lineChartData: {
                           datasets: [
                              {
                                 label: this.jsonData.myTeam.name,
                                 data: [
                                           { x: 0, y: 0 },
                                           { x: 2, y: 0.5, player: 'Corti' },
                                           { x: 5, y: 1.0, player: 'Corti' },
                                           { x: 7, y: 1.2, player: 'Zanoletti' },
                                           { x: 9, y: 2.5 },
                                           { x: 11, y: 3.5 },
                                           { x: 13, y: 4.0 },
                                           { x: 15, y: 4.5 },
                                           { x: 16, y: 5.0 },
                                           { x: 17, y: 5.0 },
                                           { x: 20, y: 5.5 },
                                           { x: 22, y: 6.0 },
                                           { x: 25, y: 7.1 },
                                           { x: 27, y: 7.5 },
                                           { x: 29, y: 8.5 },
                                           { x: 29, y: 10 }
                                        ] as any,
                                 borderColor: 'rgb(255, 0, 0)',
                                 stepped: 'after',
                                 pointRadius: 6,
                                 pointBackgroundColor: '#ff7777',
                                 pointBorderWidth: 2,
                                 pointStyle: (context: any) => {
                                    const value = context.dataset.data[context.dataIndex] as any;
                                    if (value?.delta != undefined)
                                    {
                                       if (value.delta > 0)
                                          return 'circle';
                                       else
                                          return 'cross';
                                    }
                                    else
                                       return 'circle';
                                 }
                              },
                              {
                                 label: this.jsonData.oppoTeam.name,
                                 data: [
                                    { x: 0, y: 0 },
                                    { x: 2, y: 2 },
                                    { x: 5, y: 5.3 },
                                    { x: 6, y: 7.9 },
                                    { x: 8, y: 9 },
                                    { x: 8, y: 10 }
                                 ],
                                 borderColor: 'rgb(0, 127, 0)',
                                 stepped: 'after',
                                 pointRadius: 6,
                                 pointBackgroundColor: '#77ff77',
                                 pointBorderWidth: 2,
                                 pointStyle: (context: any) => {
                                    const value = context.dataset.data[context.dataIndex] as any;
                                    if (value?.delta != undefined)
                                    {
                                       if (value.delta > 0)
                                          return 'circle';
                                       else
                                          return 'cross';
                                    }
                                    else
                                       return 'circle';
                                 }
                              },
                           ]
                        },
                        lineChartOptions: {
                           responsive: true,
                           maintainAspectRatio: false,
                           indexAxis: 'y', // Mantiene la logica Y per il tempo
                           layout: {          // <-- stesso livello di scales e plugins
                              padding: {
                                 left: 20
                              }
                           },
                           scales: {
                              x: {
                                 type: 'linear',
                                 position: 'top',
                                 beginAtZero: (i == 0) ? true : false,
                                 min: 0,
                                 max: 100,
                                 title: { display: true, text: 'Punti' },
                                 ticks: {
                                    stepSize: 1
                                 }
                              },
                              y: {
                                 type: 'linear',
                                 reverse: true,
                                 min: 0,
                                 max: 10,
                                 title: { display: true, text: 'Minuti di gioco' },
                                 ticks: {
                                    stepSize: 1
                                 }
                              }
                           },
                           plugins: {
                              // --- CONFIGURAZIONE DATALABELS ---
                              datalabels: {
                                 backgroundColor: (context) => context.dataset.borderColor as string,
                                 borderRadius: 4,
                                 color: (context) => {
                                    const value = context.dataset.data[context.dataIndex] as any;
                                    let clr: string = 'white';
                                    if (value.delta != undefined)
                                    {
                                       if (value.delta == 0)
                                          clr = 'black';
                                    }
                                    return clr;
                                 },
                                 font: {
                                    weight: 'bold',
                                    size: 14
                                 },
                                 padding: 4,
                                 // Poiché indexAxis è 'y', la label deve seguire la coordinata X (i punti)
                                 anchor: 'center',
                                 align: 'right',
                                 offset: (context) => {
                                    const value = context.dataset.data[context.dataIndex] as any;
                                    let ffst: number = 8;
                                    if (value.sameTime != undefined)
                                       if (value.sameTime === true)
                                          ffst = 250;
                                    return ffst;
                                 },
                                 formatter: (value: any) => {
                                    // Mostriamo il valore X (i punti realizzati)
                                    let dlt:string = "";
                                    if (value.delta)
                                    {
                                       if (value.delta == 3)
                                          dlt = `{+3️⃣}  ->  `;
                                       else if (value.delta == 2)
                                          dlt = `{+2️⃣}  ->  `;
                                       else if (value.delta == 1)
                                          dlt = `{+1️⃣}  ->  `;
                                    }
                                    const pl: string = value.player ? `          ${value.player}` : '';
                                    const tmp: string = value.tempo ? `[${value.tempo}]  ` : "";
                                    return `${tmp}${dlt}${value.x}${pl}`;
                                 },
                                 // Nasconde la label se il valore è 0 (opzionale) o se sono troppo vicine
                                 display: (context) => {
                                    return context.active || (context.dataIndex % 1 === 0);
                                 }
                              },
                              // --- CONFIGURAZIONE TOOLTIP ---
                              tooltip: {
                                 callbacks: {
                                    label: (context: any) => `Punti: ${context.raw.x} al minuto ${context.raw.y}`
                                 }
                              },
                              // --- CONFIGURAZIONE ANNOTATION ---
                              annotation: {
                                 annotations: {
                                    fallo1: {
                                       type: 'line',
                                       yMin: 3.5,
                                       yMax: 3.5,
                                       borderColor: 'red',
                                       borderWidth: 2,
                                       borderDash: [5, 5],
                                       label: {
                                          display: true,
                                          content: 'Fallo: Belinelli',
                                          position: 'start',
                                          backgroundColor: 'orange',
                                          font: { size: 14 },
                                          xAdjust: 0
                                       }
                                    },
                                    cambio1: {
                                       type: 'label',
                                       xValue: 0,
                                       yValue: 7,
                                       position: { x: 'start', y: 'center' },
                                       backgroundColor: '#00ffff',
                                       content: '⇄ in Teodosic   ---   out Hackett',
                                       font: { size: 14 },
                                    }
                                 }
                              }
                           }
                        }
                     });
                  myTeamPti += this.quarti[i].MyTeamCurrPoint;
                  oppoTeamPti += this.quarti[i].OppTeamCurrPoint;
               }
            }
            /*
            [
               {
                  "ID": 2097,
                  "LinkMatchHeader": 264,
                  "Num": 1,
                  "IsRegular": true,
                  "Status": 2,
                  "MyTeamStartPoint": null,
                  "OppTeamStartPoint": null,
                  "MyTeamCurrPoint": 15,
                  "OppTeamCurrPoint": 9,
                  "MyTeamFouls": 5,
                  "OppTeamFouls": 6,
                  "MyTeamBonus": true,
                  "OppTeamBonus": true
               },
               ...
               {
                  "ID": 2101,
                  "LinkMatchHeader": 264,
                  "Num": 5,
                  "IsRegular": false,
                  "Status": 0,
                  "MyTeamStartPoint": null,
                  "OppTeamStartPoint": null,
                  "MyTeamCurrPoint": 0,
                  "OppTeamCurrPoint": 0,
                  "MyTeamFouls": 0,
                  "OppTeamFouls": 0,
                  "MyTeamBonus": false,
                  "OppTeamBonus": false
               },
            ]
            */
         }
      }
      await this.PopulateChartData();
      setTimeout(async() => { await this.exportToPDF(); }, 5000);
   }


   async aaaa (isMyTeam: boolean,
               qrtNum: number)
   {
      let sTeam: string = "";
      let tMax: number = 600;

      if (isMyTeam)
      {
         sTeam = "|MyTeam  |";
      }
      else
      {
         sTeam = "|OppoTeam|";
      }
      if (this.quarti[qrtNum-1].IsRegular == false)
         tMax = 300;
      let arrQ: string[] = this.eventsData.split (/\r?\n/).filter (sss => sss.startsWith ("Q"+qrtNum.toString()));
      arrQ = arrQ.filter (sss => sss.includes (sTeam, 0));
      const arrQui: string[] = arrQ.filter (sss => sss.includes ("|Quintet", 0));
      const arrSos: string[] = arrQ.filter (sss => sss.includes ("|Sostit", 0));
/*
Q1|10:00|Quintet   |MyTeam  |24|Dema K.|24;
Q1|10:00|Quintet   |MyTeam  | 2|Zanoletti F.|24;2;
Q1|10:00|Quintet   |MyTeam  |26|Corti M.|24;2;26;
Q1|10:00|Quintet   |MyTeam  | 9|Gonzini D.|24;2;26;9;
Q1|10:00|Quintet   |MyTeam  |30|Mosca S.|24;2;26;9;30;
-------
Q1|04:40|Sostit    |OppoTeam|Out 5|In67
Q1|04:40|Sostit    |OppoTeam|Out23|In82
*/
      let sNum: string = "";
      let sNumOut: string = "";
      let giocatori: Array<any> = [];
      let conta: number = 0;
      for (let i=(arrQui.length-1);   i>=0;   i--)
      {
         conta++;
         sNum = arrQui[i].substring(29, 31)
         if (sNum[0] == " ")
            sNum = "0"+sNum.slice(1,100);
         giocatori.push ({
                            num: sNum,
                            min: 0,
                            tempo: "",
                            in: tMax,
                            out: -1,
                            isopen: true
                           });
         if (conta >= 5)
            break;
      }
      let outIdx: number;
      let inIdx: number;
      let tempoSec: number;
      for (let i=0;   i<arrSos.length;   i++)
      {
         sNum = arrSos[i].substring(37, 39)
         if (sNum[0] == " ")
            sNum = "0"+sNum.slice(1,100);
         sNumOut = arrSos[i].substring(32, 34)
         if (sNumOut[0] == " ")
            sNumOut = "0"+sNumOut.slice(1,100);
         // cerco il giocatore che esce nell'array (DEVE GIA' ESSERE PRESENTE)
         outIdx = giocatori.findIndex (item => item.num == sNumOut);
         if (outIdx >= 0)
         {
            tempoSec = (Number (arrSos[i].substring (3, 5)) * 60) + (Number (arrSos[i].substring (6, 8)));
            giocatori[outIdx].out = tempoSec;
            giocatori[outIdx].min += (giocatori[outIdx].in - giocatori[outIdx].out);
            giocatori[outIdx].in = -1;0
            giocatori[outIdx].out = -1;
            giocatori[outIdx].isopen = false;
            //
            inIdx = giocatori.findIndex (item => item.num == sNum);
            if (inIdx < 0)
            {
               giocatori.push ({
                                  num: sNum,
                                  min: 0,
                                  tempo: "",
                                  in: tempoSec-0,
                                  out: -1,
                                  isopen: true
                               });
            }
            else
            {
               giocatori[inIdx].in = tempoSec-0;
               giocatori[inIdx].out = -1;
               giocatori[inIdx].isopen = true;
            }
         }
      }
      //
      for (let i=0;   i<giocatori.length;   i++)
      {
         if (giocatori[i].isopen)
         {
            let delta: number = 0;
            giocatori[i].out = 0;
            if (giocatori[i].in < 0)
               giocatori[i].in = tMax;
            //if (giocatori[i].min > 0)
            //   delta++;
            giocatori[i].min += (giocatori[i].in - giocatori[i].out + delta);
            giocatori[i].isopen = false;
         }
      }
      let st: string = "";
      for (let i=0;   i<giocatori.length;   i++)
      {
         st = `${(Math.trunc (giocatori[i].min / 60)).toString ().padStart (2, "0")}:${(giocatori[i].min % 60).toString ().padStart (2, "0")}`;
         giocatori[i].tempo = st;
      }
      //
      for (let i=0;   i<giocatori.length;   i++)
      {
         let plrIdx: number;
         let pn: string;
         if (isMyTeam)
         {
            pn = (Number(giocatori[i].num)).toString ();
            plrIdx = this.jsonData.myTeam.players.findIndex((item: any) => item.playNumber == pn);
            if (plrIdx >= 0)
            {
               if (qrtNum == 1)
               {
                  this.jsonData.myTeam.players[plrIdx].totali.q1.min = giocatori[i].min;
                  this.jsonData.myTeam.players[plrIdx].totali.q1.dato = `${this.jsonData.myTeam.players[plrIdx].totali.q1.punti.toString ()}</b><br><span style="font-size: 0.75rem;">${giocatori[i].tempo}</span>`;
               }
               else if (qrtNum == 2)
               {
                  this.jsonData.myTeam.players[plrIdx].totali.q2.min = giocatori[i].min;
                  this.jsonData.myTeam.players[plrIdx].totali.q2.dato = `${this.jsonData.myTeam.players[plrIdx].totali.q2.punti.toString ()}</b><br><span style="font-size: 0.75rem;">${giocatori[i].tempo}</span>`;
               }
               else if (qrtNum == 3)
               {
                  this.jsonData.myTeam.players[plrIdx].totali.q3.min = giocatori[i].min;
                  this.jsonData.myTeam.players[plrIdx].totali.q3.dato = `${this.jsonData.myTeam.players[plrIdx].totali.q3.punti.toString ()}</b><br><span style="font-size: 0.75rem;">${giocatori[i].tempo}</span>`;
               }
               else if (qrtNum == 4)
               {
                  this.jsonData.myTeam.players[plrIdx].totali.q4.min = giocatori[i].min;
                  this.jsonData.myTeam.players[plrIdx].totali.q4.dato = `${this.jsonData.myTeam.players[plrIdx].totali.q4.punti.toString ()}</b><br><span style="font-size: 0.75rem;">${giocatori[i].tempo}</span>`;
               }
               else if (qrtNum > 4)
               {
                  this.jsonData.myTeam.players[plrIdx].totali.et.min = giocatori[i].min;
                  this.jsonData.myTeam.players[plrIdx].totali.et.dato = `${this.jsonData.myTeam.players[plrIdx].totali.et.punti.toString ()}</b><br><span style="font-size: 0.75rem;">${giocatori[i].tempo}</span>`;
               }
            }
         }
      }
   }


   async PopulateChartData()
   {
/*
      datasets: [
         {
            label: 'Sarezzo',
            data: [
               { x: 0, y: 0 },
               { x: 2, y: 0.5, player: 'Corti' },
               { x: 5, y: 1.0, player: 'Corti' },
               { x: 7, y: 1.2, player: 'Zanoletti' },
               { x: 9, y: 2.5 },
               { x: 11, y: 3.5 },
               { x: 13, y: 4.0 },
               { x: 15, y: 4.5 },
               { x: 16, y: 5.0 },
               { x: 17, y: 5.0 },
               { x: 20, y: 5.5 },
               { x: 22, y: 6.0 },
               { x: 25, y: 7.1 },
               { x: 27, y: 7.5 },
               { x: 29, y: 8.5 },
               { x: 29, y: 10 }
            ] as any,
            borderColor: 'rgb(255, 0, 0)',
            stepped: 'after',
            pointRadius: 4 // Rende il punto leggermente più visibile per la label
         },
         {
            label: 'Lussana',
            data: [
               { x: 0, y: 0 },
               { x: 2, y: 2 },
               { x: 5, y: 5.3 },
               { x: 6, y: 7.9 },
               { x: 8, y: 9 },
               { x: 8, y: 10 }
            ],
            borderColor: 'rgb(0, 127, 0)',
            stepped: 'after',
            pointRadius: 4
         },
      ]

*/
      let qrtNum: number = 1;
      let sss: string = "";
      let sMin: string = "";
      let sSec: string = "";
      let sPlr: string = "";
      let sPlr2: string = "";
      let min: number = 0;
      let prevMin: number = -1;
      let elem: Array<string> = [];
      let punti: number = 0;
      let delta: number = 0;
      let arrQ: string[] = [];
      let valoreMinimo: number = 0;
      let sposta: boolean = false;
      for (let i=0;   i<this.quartiGiocati.length;   i++)
      {
         if (this.quartiGiocati[i].status > 1)
         {
            qrtNum = i+1;
            valoreMinimo = this.quartiGiocati[i].myTeamPunti1;
            if (this.quartiGiocati[i].oppoTeamPunti1 < valoreMinimo)
               valoreMinimo = this.quartiGiocati[i].oppoTeamPunti1;
            if (i > 0)
               valoreMinimo -= 4;
            this.quartiGiocati[i].lineChartData.datasets[0].label = this.jsonData.myTeam.name;
            this.quartiGiocati[i].lineChartData.datasets[1].label = this.jsonData.oppoTeam.name;
            this.quartiGiocati[i].lineChartData.datasets[0].data = [] as any;
            this.quartiGiocati[i].lineChartData.datasets[0].data.push ({ x: this.quartiGiocati[i].myTeamPunti1, y: 0 });
            this.quartiGiocati[i].lineChartData.datasets[1].data = [] as any;
            this.quartiGiocati[i].lineChartData.datasets[1].data.push ({ x: this.quartiGiocati[i].oppoTeamPunti1, y: 0 });
            arrQ = this.eventsData.split (/\r?\n/).filter (sss => sss.startsWith ("Q"+qrtNum.toString()));
            arrQ = arrQ.filter (sss => sss.includes ("|MyTeam  |", 0));
            sss = "";
            sMin = "";
            sSec = "";
            sPlr = "";
            sPlr2 = "";
            min = 0;
            prevMin = -1;
            elem = [];
            punti = this.quartiGiocati[i].myTeamPunti1;
            delta = 0;
            for (let j=0;   j<arrQ.length;   j++)
            {
               // 0  0     0          1        2  9
               // 0  3     9          9        7  9
               // Q1|09:40|T2 Ok     |MyTeam  |26|(Corti M.)|[]|SAR-LUS: 2-0|343;81
               sss = arrQ[j].trim();
               try
               {
                  sposta = false;
                  if ((sss.includes("|TL Ok", 0)) ||
                     (sss.includes("|T2 Ok", 0)) ||
                     (sss.includes("|T3 Ok", 0)))
                  {
                     if (sss.includes("|TL Ok", 0))
                        delta = 1;
                     if (sss.includes("|T2 Ok", 0))
                        delta = 2;
                     if (sss.includes("|T3 Ok", 0))
                        delta = 3;
                     punti += delta;
                     elem = sss.split("|");
                     sMin = elem[1].substring(0, 2);
                     sSec = elem[1].substring(3, 5);
                     sPlr = elem[5];
                     min = 10-((60*(Number(sMin))+(Number(sSec)))/60);
                     if (min == prevMin)
                     {
                        min = 10 - ((60 * (Number (sMin)) + (-2 + Number (sSec))) / 60);
                        sposta = true;
                     }
                     this.quartiGiocati[i].lineChartData.datasets[0].data.push (
                        {
                           x: punti,
                           y: min,
                           player: sPlr,
                           delta: delta,
                           punti: punti,
                           tempo: elem[1],
                           sameTime: sposta
                        } as any);
                     prevMin = min;
                     sposta = false;
                  }
                  if ((sss.includes("|T2 no", 0)) ||
                     (sss.includes("|T3 no", 0)))
                  {
                     elem = sss.split("|");
                     sMin = elem[1].substring(0, 2);
                     sSec = elem[1].substring(3, 5);
                     sPlr = elem[5];
                     min = 10-((60*(Number(sMin))+(Number(sSec)))/60);
                     if (min == prevMin)
                     {
                        min = 10 - ((60 * (Number (sMin)) + (-2 + Number (sSec))) / 60);
                        sposta = true;
                     }
                     this.quartiGiocati[i].lineChartData.datasets[0].data.push (
                        {
                           x: punti,
                           y: min,
                           delta: 0,
                           player: sPlr,
                           tempo: elem[1],
                           sameTime: sposta
                        } as any);
                     prevMin = min;
                     sposta = false;
                  }
               }
               catch (e)
               {
                  console.error(e);
               }
            }
            this.quartiGiocati[i].lineChartData.datasets[0].data.push ({ x: punti, y: 10 });
            if (this.quartiGiocati[i].lineChartOptions.scales)
            {
               (this.quartiGiocati[i].lineChartOptions.scales!['x'] as any).min = valoreMinimo;
               (this.quartiGiocati[i].lineChartOptions.scales!['x'] as any).max = punti + 6;
            }
            //
            (this.quartiGiocati[i].lineChartOptions.plugins as any).annotation.annotations = {};
            for (let j=0;   j<arrQ.length;   j++)
            {
               sss = arrQ[j].trim();
               try
               {
                  if (sss.includes("|Sostit ", 0))
                  {
                     // Q2|04:09|Sostit    |MyTeam  |Out 0|In 2
                     elem = sss.split("|");
                     sMin = elem[1].substring(0, 2);
                     sSec = elem[1].substring(3, 5);
                     sPlr = elem[4].substring(3, 5);
                     sPlr2 = elem[5].substring(2,4);
                     sPlr = await this.GetMyTeamPlayer (sPlr);
                     sPlr2 = await this.GetMyTeamPlayer (sPlr2);
                     min = 10-((60*(Number(sMin))+(Number(sSec)))/60);
                     if (min == prevMin)
                     {
                        min = 10 - ((60 * (Number (sMin)) + (-10 + Number (sSec))) / 60);
                        sposta = true;
                     }
                     const annotations = (this.quartiGiocati[i].lineChartOptions.plugins as any).annotation.annotations;
                     const key = `Sostit_myteam_${j}_${sMin}_${sSec}`;
                     annotations[key] = {
                        type:            'label',
                        xValue:          (sposta) ? (valoreMinimo+3) : valoreMinimo,
                        yValue:          min,
                        position:        { x: 'start', y: 'center' },
                        backgroundColor: '#00ffff',
                        content:         `[${sMin}:${sSec}] in ${sPlr2} ⇄ out ${sPlr}`,
                        font:            { size: 13, weight: 'bold' },
                     };
                     prevMin = min;
                     sposta = false;
                  }
                  if (sss.includes("|FFatto ", 0))
                  {
                     elem = sss.split("|");
                     sMin = elem[1].substring(0, 2);
                     sSec = elem[1].substring(3, 5);
                     sPlr = elem[5];
                     min = 10-((60*(Number(sMin))+(Number(sSec)))/60);
                     if (min == prevMin)
                        min = 10-((60*(Number(sMin))+(-2+Number(sSec)))/60);
                     const annotations = (this.quartiGiocati[i].lineChartOptions.plugins as any).annotation.annotations;
                     const key = `fallo_myteam_${j}_${sMin}_${sSec}`;
                     annotations[key] = {
                        type:            'label',
                        xValue:          valoreMinimo,
                        yValue:          min,
                        position:        { x: 'start', y: 'center' },
                        backgroundColor: '#ffaa00',
                        content:         `[${sMin}:${sSec}] Fallo ${sPlr}`,
                        font:            { size: 13, weight: 'bold' },
                     };
                     prevMin = min;
                  }
               }
               catch (e)
               {

               }
            }
            /*
            Q1|08:30|FFatto    |MyTeam  |24|(Dema K.)|
                     annotation: {
                        annotations: {
                           fallo1: {
                              type: 'line',
                              yMin: 3.5,
                              yMax: 3.5,
                              borderColor: 'red',
                              borderWidth: 2,
                              borderDash: [5, 5],
                              label: {
                                 display: true,
                                 content: 'Fallo: Belinelli',
                                 position: 'start',
                                 backgroundColor: 'orange',
                                 font: { size: 14 },
                                 xAdjust: 0
                              }
                           },
                           cambio1: {
                              type: 'label',
                              xValue: 0,
                              yValue: 7,
                              position: { x: 'start', y: 'center' },
                              backgroundColor: '#00ffff',
                              content: '⇄ in Teodosic   ---   out Hackett',
                              font: { size: 14 },
                           }
                        }
                     }

            */
            //
            arrQ = this.eventsData.split (/\r?\n/).filter (sss => sss.startsWith ("Q"+qrtNum.toString()));
            arrQ = arrQ.filter (sss => sss.includes ("|OppoTeam|", 0));
            sss = "";
            sMin = "";
            sSec = "";
            sPlr = "";
            min = 0;
            prevMin = -1;
            elem = [];
            punti = this.quartiGiocati[i].oppoTeamPunti1;;
            delta = 0;
            for (let j=0;   j<arrQ.length;   j++)
            {
               // 0  0     0          1        2  9
               // 0  3     9          9        7  9
               // Q1|09:40|T2 Ok     |MyTeam  |26|(Corti M.)|[]|SAR-LUS: 2-0|343;81
               sss = arrQ[j].trim();
               sposta = false;
               try
               {
                  if ((sss.includes("|TL Ok", 0)) ||
                     (sss.includes("|T2 Ok", 0)) ||
                     (sss.includes("|T3 Ok", 0)))
                  {
                     if (sss.includes("|TL Ok", 0))
                        delta = 1;
                     if (sss.includes("|T2 Ok", 0))
                        delta = 2;
                     if (sss.includes("|T3 Ok", 0))
                        delta = 3;
                     punti += delta;
                     elem = sss.split("|");
                     sMin = elem[1].substring(0, 2);
                     sSec = elem[1].substring(3, 5);
                     sPlr = elem[5];
                     min = 10-((60*(Number(sMin))+(Number(sSec)))/60);
                     if (min == prevMin)
                     {
                        min = 10 - ((60 * (Number (sMin)) + (-2 + Number (sSec))) / 60);
                        sposta = true;
                     }
                     prevMin = min;
                     this.quartiGiocati[i].lineChartData.datasets[1].data.push ({
                                                                        x: punti,
                                                                        y: min,
                                                                        player: sPlr,
                                                                        punti: punti,
                                                                        tempo: elem[1],
                                                                        sameTime: sposta
                                                                     } as any);
                     sposta = false;
                  }
               }
               catch (e)
               {

               }
            }
            this.quartiGiocati[i].lineChartData.datasets[1].data.push ({ x: punti, y: 10 });
            //
            if (this.quartiGiocati[i].lineChartOptions.scales)
            {
               (this.quartiGiocati[i].lineChartOptions.scales!['x'] as any).min = valoreMinimo;
               if ((this.quartiGiocati[i].lineChartOptions.scales!['x'] as any).max < (punti+6))
                  (this.quartiGiocati[i].lineChartOptions.scales!['x'] as any).max = punti+6;
            }
         }
      }
      //
      //
      this.chart?.render();
      setTimeout (() => {this.chart?.update();}, 1000);
      setTimeout (() => {this.chart?.update();}, 2500);
      setTimeout (() => {this.chart?.update();}, 4000);
   }


   async GetMyTeamPlayer (sNum: string): Promise<string>
   {
      let result: string = sNum;
      sNum = sNum.trim();
      for (let i=0;   i<this.jsonData.myTeam.players.length;   i++)
      {
         if (sNum == this.jsonData.myTeam.players[i].playNumber)
            result = this.jsonData.myTeam.players[i].name;
      }
      return result;
   }


   GetMatchTitle(): string
   {
      let result: string ="";
      if (this.partitaOk)
         if (this.jsonData.myTeam)
            result = `<span style="color: red !important;">${this.jsonData.myTeam.name}</span> - <span style="color: green !important;">${this.jsonData.oppoTeam.name}</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${this.jsonData.myTeam.totali.punti} - ${this.jsonData.oppoTeam.totali.punti}`;
      return result;
   }


   GetParziali(): string
   {
      let result: string ="";
      if (this.partitaOk)
         if (this.jsonData.myTeam)
         {
            let q1: string = "";
            let q2: string = "";
            let q3: string = "";
            let q4: string = "";
            if (this.quarti[0].Status > 0)
               q1 = `(${this.quarti[0].MyTeamCurrPoint} - ${this.quarti[0].OppTeamCurrPoint})`;
            if (this.quarti[1].Status > 0)
               q2 = `   (${this.quarti[1].MyTeamCurrPoint} - ${this.quarti[1].OppTeamCurrPoint})`;
            if (this.quarti[2].Status > 0)
               q3 = `   (${this.quarti[2].MyTeamCurrPoint} - ${this.quarti[2].OppTeamCurrPoint})`;
            if (this.quarti[3].Status > 0)
               q4 = `   (${this.quarti[3].MyTeamCurrPoint} - ${this.quarti[3].OppTeamCurrPoint})`;
            result = `${q1}${q2}${q3}${q4}`;
         }

      return result;
   }


   GetProgressivi(): string
   {
      let result: string ="";
      if (this.partitaOk)
         if (this.jsonData.myTeam)
            result = `${this.jsonData.myTeam.name} - ${this.jsonData.oppoTeam.name}   ${this.jsonData.myTeam.totali.punti} - ${this.jsonData.oppoTeam.totali.punti}`;
      return result;
   }


   async xmlToJsonStr(xmlData: string): Promise<any>
   {
      let result: string = "";
      try
      {
         const options = {
            ignoreAttributes: false, // Se vuoi mantenere gli attributi (es. id="1")
            // Funzione magica: restituisce true solo per i tag che DEVONO essere array
            isArray: (name: string, jpath: string, isLeafNode: boolean, isAttribute: boolean) => {
               const tagsToForceAsArray = ["Fallo", "Realizzazione", "Player"];
               // Se il nome del tag contiene una di queste parole, lo rende un array
               return tagsToForceAsArray.some(forcedTag => name.includes(forcedTag));
            }
         };
         let fixed: string = await this.fixInvalidXmlTags(xmlData);
         const parser = new XMLParser(options);
         result = parser.parse(fixed);
      }
      catch(e)
      {
         result = "error";
      }
      return result;
   }


   async fixInvalidXmlTags(xml: string): Promise<string>
   {
      // Questa regex cerca i tag che iniziano con un numero e aggiunge "node_" davanti
      // Esempio: <1> diventa <node_1>, </2> diventa </node_2>, <1Tempo> diventa <node_1Tempo>
      return xml
         .replace(/<(\d+)/g, '<node_$1')    // Fix tag di apertura
         .replace(/<\/(\d+)/g, '</node_$1') // Fix tag di chiusura
         .replace(/<(\d+\w+)/g, '<node_$1') // Fix tag tipo <1Tempo>
         .replace(/<\/(\d+\w+)/g, '</node_$1'); // Fix chiusura tipo </1Tempo>
   }


   async ExtractPlayer (srcPlr: any,
                        isMyTeam: boolean): Promise<any>
   {
      let tlF: number = 0;
      let tlR: number = 0;
      let t2F: number = 0;
      let t2R: number = 0;
      let t3F: number = 0;
      let t3R: number = 0;
      let tcF: number = 0;
      let tcR: number = 0;
      let result: any = {
         id: srcPlr.PlayerRecID[0],
         name: srcPlr.Name,
         playNumber: srcPlr.PlayNumber.toString(),
         captain: srcPlr.Captain,
         tempoGioco: srcPlr.TempoGioco,
         rimdDifesa: srcPlr.RimbDifesa,
         rimbAttacco: srcPlr.RimbAttacco,
         pallePerse: srcPlr.PallePerse,
         palleRecuperate: srcPlr.PalleRecuperate,
         stoppateSubite: srcPlr.StoppateSubite,
         stoppateFatte: srcPlr.StoppateFatte,
         assist: srcPlr.Assist,
         inTime: srcPlr.Intime,
         outTime: srcPlr.OutTime,
         inGioco: srcPlr.InGioco,
         plusMinus: srcPlr.PlusMinus,
         inQuintetto: srcPlr.InQuintetto,
         falliSubiti: srcPlr.FalliSubiti,
         falliFatti: [],
         totRealizzazioni: srcPlr.TotRealizzazioni,
         realizzazioni: [],
         totali: {
            punti: 0,
            min: "n.e.",
            tl: "",
            tlF: 0,
            tlR: 0,
            t2: "",
            t2F: 0,
            t2R: 0,
            t3: "",
            t3F: 0,
            t3R: 0,
            tdc: "",
            tcF: 0,
            tcR: 0,
            fFatti: 0,
            fSubiti: 0,
            rDif: 0,
            rAtt: 0,
            rTot: 0,
            pPerse: 0,
            pRecuperate: 0,
            assist: 0,
            stopFatte: 0,
            stopSubite: 0,
            plusMinus: 0,
            pir: 0,
            oer: 0,
            eFGp: 0,
            TSp: 0,
            q1: {
               punti: 0,
               min: 0,
               dato: ""
            },
            q2: {
               punti: 0,
               min: 0,
               dato: ""
            },
            q3: {
               punti: 0,
               min: 0,
               dato: ""
            },
            q4: {
               punti: 0,
               min: 0,
               dato: ""
            },
            et: {
               punti: 0,
               min: 0,
               dato: ""
            }
         }
      };
      result.falliFatti.push(srcPlr.Fallo1[0]);
      result.falliFatti.push(srcPlr.Fallo2[0]);
      result.falliFatti.push(srcPlr.Fallo3[0]);
      result.falliFatti.push(srcPlr.Fallo4[0]);
      result.falliFatti.push(srcPlr.Fallo5[0]);
      const rrr = await this.NormalizeRealizzazione(srcPlr);
      result.realizzazioni = rrr.Realizzazioni;
      //
      let toProcess: boolean = false;
      if (isMyTeam === false)
         toProcess = true;
      else
         toProcess = (result.tempoGioco > 0);
      if (toProcess)
      {
         for (let i=0;   i<result.realizzazioni.length;   i++)
         {
            result.totali.punti += result.realizzazioni[i].Punti;
            if (result.realizzazioni[i].Tipo == 1)
            {
               tlF++;
               if (result.realizzazioni[i].Punti > 0)
                  tlR++;
            }
            if (result.realizzazioni[i].Tipo == 2)
            {
               t2F++;
               tcF++;
               if (result.realizzazioni[i].Punti > 0)
               {
                  t2R++;
                  tcR++;
               }
            }
            if (result.realizzazioni[i].Tipo == 3)
            {
               t3F++;
               tcF++;
               if (result.realizzazioni[i].Punti > 0)
               {
                  t3R++;
                  tcR++;
               }
            }
            if (result.realizzazioni[i].Quarto == 1)
               result.totali.q1.punti += result.realizzazioni[i].Punti;
            if (result.realizzazioni[i].Quarto == 2)
               result.totali.q2.punti += result.realizzazioni[i].Punti;
            if (result.realizzazioni[i].Quarto == 3)
               result.totali.q3.punti += result.realizzazioni[i].Punti;
            if (result.realizzazioni[i].Quarto == 4)
               result.totali.q4.punti += result.realizzazioni[i].Punti;
            if (result.realizzazioni[i].Quarto > 4)
               result.totali.et.punti += result.realizzazioni[i].Punti;
         }
         result.totali.tlR = tlR;
         result.totali.tlF = tlF;
         if (tlF > 0)
            result.totali.tl = `<b>${tlR}/${tlF}</b><br><span style="font-size: 0.75rem;">(${Math.trunc(100*tlR/tlF)}%)</span>`;
         result.totali.t2R = t2R;
         result.totali.t2F = t2F;
         if (t2F > 0)
            result.totali.t2 = `<b>${t2R}/${t2F}</b><br><span style="font-size: 0.75rem;">(${Math.trunc(100*t2R/t2F)}%)</span>`;
         result.totali.t3R = t3R;
         result.totali.t3F = t3F;
         if (t3F > 0)
            result.totali.t3 = `<b>${t3R}/${t3F}</b><br><span style="font-size: 0.75rem;">(${Math.trunc(100*t3R/t3F)}%)</span>`;
         result.totali.tcR = tcR;
         result.totali.tcF = tcF;
         if (tcF > 0)
            result.totali.tdc = `<b>${tcR}/${tcF}</b><br><span style="font-size: 0.75rem;">(${Math.trunc(100*tcR/tcF)}%)</span>`;
         result.totali.min = `${(Math.trunc (result.tempoGioco / 60)).toString ().padStart (2, "0")}:${(result.tempoGioco % 60).toString ().padStart (2, "0")}`;
         for (let i=0;   i<result.falliFatti.length;   i++)
         {
            if (result.falliFatti[i].Commesso)
               result.totali.fFatti++;
         }
         result.totali.fSubiti = result.falliSubiti;
         result.totali.rDif = result.rimdDifesa;
         result.totali.rAtt = result.rimbAttacco;
         result.totali.rTot = result.rimdDifesa+result.rimbAttacco;
         result.totali.pPerse = result.pallePerse;
         result.totali.pRecuperate = result.palleRecuperate;
         result.totali.assist = result.assist;
         result.totali.stopFatte = result.stoppateFatte;
         result.totali.stopSubite = result.stoppateSubite;
         result.totali.pir = (result.totali.punti + result.totali.rTot + result.totali.assist + result.totali.pRecuperate + result.totali.stopFatte + result.totali.fSubiti) -
                             ((tcF-tcR) + (tlF-tlR) + result.totali.stopSubite + result.totali.pPerse + result.totali.fFatti);
         let den: number = (tcF + (0.44*tlF) + result.totali.pPerse);
         if (den != 0)
         {
            const oer: number = (result.totali.punti) / (den);
            result.totali.oer = oer;//.toFixed (1);
         }
         // Effective Field Goal Percentage
         if (tcF != 0)
         {
            const eFGp: number = (tcR + (0.5 * t3R)) / (tcF);
            result.totali.eFGp = Math.round(100*eFGp);  //eFGp.toFixed (2);
         }
         // True Shooting Percentage
         den = (2 * (tcF + (0.44*tlF)));
         if (den != 0)
         {
            const TSp: number = (result.totali.punti) / (den);
            result.totali.TSp = Math.round(100*TSp); //TSp.toFixed (2);
         }
         // Usage Rate percentage
         //const USGp: number = ((tcF + (0.44*tlF) + result.totali.pPerse) * (200/5)) / ((result.totali.min/60)*());
      }
      else
      {
         result.totali.punti = "";
         result.totali.fFatti = "";
         result.totali.fSubiti = "";
         result.totali.rDif = "";
         result.totali.rAtt = "";
         result.totali.rTot = "";
         result.totali.pPerse = "";
         result.totali.pRecuperate = "";
         result.totali.assist = "";
         result.totali.stopFatte = "";
         result.totali.stopSubite = "";
         result.totali.plusMinus = "";
         result.totali.oer = "";
         result.totali.pir = "";
         result.totali.eFGp = "";
         result.totali.TSp = "";
         result.totali.q1.punti = 0;
         result.totali.q1.min = "";
         result.totali.q1.dato = "";
         result.totali.q2.punti = 0;
         result.totali.q2.min = "";
         result.totali.q2.dato = "";
         result.totali.q3.punti = 0;
         result.totali.q3.min = "";
         result.totali.q3.dato = "";
         result.totali.q4.punti = 0;
         result.totali.q4.min = "";
         result.totali.q4.dato = "";
         result.totali.et.punti = 0;
         result.totali.et.min = "";
         result.totali.et.dato = "";
      }
      //
      return result;
   }


   async NormalizeRealizzazione (srcPlr: any): Promise<any>
   {
      const { TotRealizzazioni, ...rest } = srcPlr;
      const listaRealizzazioni: any[] = [];

      // Cicliamo da 1 fino al numero totale indicato nel campo TotRealizzazioni
      for (let i = 1; i <= TotRealizzazioni; i++)
      {
         const key = `Realizzazione${i}`;

         if (srcPlr[key])
         {
            // Se il parser ha lasciato l'elemento in un array di un solo elemento [ {} ], lo estraiamo
            const data = Array.isArray(srcPlr[key]) ? srcPlr[key][0] : srcPlr[key];
            listaRealizzazioni.push(data);

            // Opzionale: rimuoviamo la chiave vecchia per pulire l'oggetto
            delete rest[key];
         }
      }

      return {
         ...rest,
         TotRealizzazioni,
         Realizzazioni: listaRealizzazioni // La nuova lista pulita
      };
   }


   GetPlayerName (elem: any): string
   {
      const qStr: string = elem.inQuintetto?" 🔶 ":"   ";
      let result: string = `${qStr}${elem.playNumber}) <b>${elem.name}</b>`;
      if (elem.captain)
         result += "  ⛹🏻‍♂️";
      return result;
   }


   GetTempoGioco (elem: any): string
   {
      if (elem.tempoGioco < 1)
         return "n.e.";
      const mm: number = Math.trunc(elem.tempoGioco / 60);
      const ss: number = elem.tempoGioco % 60;
      return `${mm.toString().padStart(2,"0")}:${ss.toString().padStart(2,"0")}`;
   }


   GetPuntiTotali (elem: any): number
   {
      let result: number = 0;
      for (let i=0;   i<elem.realizzazioni.length;   i++)
      {
         result += elem.realizzazioni[i].Punti;
      }
      return result;
   }


   GetTitiLiberi (elem: any): SafeHtml
   {
      let result: string = "";
      let fatti: number = 0;
      let tentati: number = 0;
      for (let i=0;   i<elem.realizzazioni.length;   i++)
      {
         if (elem.realizzazioni[i].Tipo == 1)
         {
            tentati++;
            if (elem.realizzazioni[i].Punti > 0)
               fatti++;
         }
      }
      if (tentati > 0)
         return this.sanitizer.bypassSecurityTrustHtml(`<b>${fatti}/${tentati}</b><br><span style="font-size: 0.75rem;">(${Math.trunc(100*fatti/tentati)}%)</span>`);
      else
         return this.sanitizer.bypassSecurityTrustHtml(`${fatti}/${tentati}`);
   }


   GetTit2 (elem: any): SafeHtml
   {
      let result: string = "";
      let fatti: number = 0;
      let tentati: number = 0;
      for (let i=0;   i<elem.realizzazioni.length;   i++)
      {
         if (elem.realizzazioni[i].Tipo == 2)
         {
            tentati++;
            if (elem.realizzazioni[i].Punti > 0)
               fatti++;
         }
      }
      if (tentati > 0)
         return this.sanitizer.bypassSecurityTrustHtml(`<b>${fatti}/${tentati}</b><br><span style="font-size: 0.75rem;">(${Math.trunc(100*fatti/tentati)}%)</span>`);
      else
         return this.sanitizer.bypassSecurityTrustHtml(`${fatti}/${tentati}`);
   }


   GetTiti3 (elem: any): SafeHtml
   {
      let result: string = "";
      let fatti: number = 0;
      let tentati: number = 0;
      for (let i=0;   i<elem.realizzazioni.length;   i++)
      {
         if (elem.realizzazioni[i].Tipo == 3)
         {
            tentati++;
            if (elem.realizzazioni[i].Punti > 0)
               fatti++;
         }
      }
      if (tentati > 0)
         return this.sanitizer.bypassSecurityTrustHtml(`<b>${fatti}/${tentati}</b><br><span style="font-size: 0.75rem;">(${Math.trunc(100*fatti/tentati)}%)</span>`);
      else
         return this.sanitizer.bypassSecurityTrustHtml(`${fatti}/${tentati}`);
   }


   GetTitiDalCampo (elem: any): SafeHtml
   {
      let result: string = "";
      let fatti: number = 0;
      let tentati: number = 0;
      for (let i=0;   i<elem.realizzazioni.length;   i++)
      {
         if ((elem.realizzazioni[i].Tipo == 2) || (elem.realizzazioni[i].Tipo == 3))
         {
            tentati++;
            if (elem.realizzazioni[i].Punti > 0)
               fatti++;
         }
      }
      if (tentati > 0)
         return this.sanitizer.bypassSecurityTrustHtml(`<b>${fatti}/${tentati}</b><br><span style="font-size: 0.75rem;">(${Math.trunc(100*fatti/tentati)}%)</span>`);
      else
         return this.sanitizer.bypassSecurityTrustHtml(`${fatti}/${tentati}`);
   }


   GetFFatti (elem: any): number
   {
      let result: number = 0;
      for (let i=0;   i<elem.falliFatti.length;   i++)
      {
         if (elem.falliFatti[i].Commesso)
         {
            result++;
         }
      }
      return result;
   }


   GetTotaliPunti(myTeam: boolean): string
   {
      try
      {
         if (myTeam)
            return this.jsonData.myTeam.totali.punti.toString();
         else
            return this.jsonData.oppoTeam.totali.punti.toString();
      }
      catch (e)
      {
         console.error(`EXCEPTION: `+e);
         return "!!";
      }
   }


   GetTotaliTempo(myTeam: boolean): string
   {
      try
      {
         if (myTeam)
            return `${(Math.trunc (this.jsonData.myTeam.totali.tempoGioco / 60)).toString ().padStart (2, "0")}:${(this.jsonData.myTeam.totali.tempoGioco % 60).toString ().padStart (2, "0")}`;
         else
            return "";//this.jsonData.oppoTeam.totali.punti.toString();
      }
      catch (e)
      {
         console.error(`EXCEPTION: `+e);
         return "!!";
      }
   }


   GetTotaliFFatti(myTeam: boolean): string
   {
      try
      {
         if (myTeam)
            return this.jsonData.myTeam.totali.fFatti.toString();
         else
            return this.jsonData.oppoTeam.totali.fFatti.toString();
      }
      catch (e)
      {
         console.error(`EXCEPTION: `+e);
         return "!!";
      }
   }


   GetTotaliFSubiti(myTeam: boolean): string
   {
      try
      {
         if (myTeam)
            return this.jsonData.myTeam.totali.fSubiti.toString();
         else
            return this.jsonData.oppoTeam.totali.fSubiti.toString();
      }
      catch (e)
      {
         console.error(`EXCEPTION: `+e);
         return "!!";
      }
   }


   GetTotaliRimbDifesa(myTeam: boolean): string
   {
      try
      {
         if (myTeam)
            return this.jsonData.myTeam.totali.rDif.toString();
         else
            return this.jsonData.oppoTeam.totali.rDif.toString();
      }
      catch (e)
      {
         console.error(`EXCEPTION: `+e);
         return "!!";
      }
   }


   GetTotaliRimbAttacco(myTeam: boolean): string
   {
      try
      {
         if (myTeam)
            return this.jsonData.myTeam.totali.rAtt.toString();
         else
            return this.jsonData.oppoTeam.totali.rAtt.toString();
      }
      catch (e)
      {
         console.error(`EXCEPTION: `+e);
         return "!!";
      }
   }


   GetTotaliRimbTot(myTeam: boolean): string
   {
      try
      {
         if (myTeam)
            return this.jsonData.myTeam.totali.rTot.toString();
         else
            return this.jsonData.oppoTeam.totali.rTot.toString();
      }
      catch (e)
      {
         console.error(`EXCEPTION: `+e);
         return "!!";
      }
   }


   GetTotaliPPerse(myTeam: boolean): string
   {
      try
      {
         if (myTeam)
            return this.jsonData.myTeam.totali.pPerse.toString();
         else
            return this.jsonData.oppoTeam.totali.pPerse.toString();
      }
      catch (e)
      {
         console.error(`EXCEPTION: `+e);
         return "!!";
      }
   }


   GetTotaliPRecuperate(myTeam: boolean): string
   {
      try
      {
         if (myTeam)
            return this.jsonData.myTeam.totali.pRecuperate.toString();
         else
            return this.jsonData.oppoTeam.totali.pRecuperate.toString();
      }
      catch (e)
      {
         console.error(`EXCEPTION: `+e);
         return "!!";
      }
   }


   GetTotaliAssist(myTeam: boolean): string
   {
      try
      {
         if (myTeam)
            return this.jsonData.myTeam.totali.assist.toString();
         else
            return this.jsonData.oppoTeam.totali.assist.toString();
      }
      catch (e)
      {
         console.error(`EXCEPTION: `+e);
         return "!!";
      }
   }


   GetTotaliStopFatte(myTeam: boolean): string
   {
      try
      {
         if (myTeam)
            return this.jsonData.myTeam.totali.stopFatte.toString();
         else
            return this.jsonData.oppoTeam.totali.stopFatte.toString();
      }
      catch (e)
      {
         console.error(`EXCEPTION: `+e);
         return "!!";
      }
   }


   GetTotaliStopSubite(myTeam: boolean): string
   {
      try
      {
         if (myTeam)
            return this.jsonData.myTeam.totali.stopSubite.toString();
         else
            return this.jsonData.oppoTeam.totali.stopSubite.toString();
      }
      catch (e)
      {
         console.error(`EXCEPTION: `+e);
         return "!!";
      }
   }


   GetTotaliPir(myTeam: boolean): string
   {
      try
      {
         if (myTeam)
            return this.jsonData.myTeam.totali.pir.toString();
         else
            return this.jsonData.oppoTeam.totali.pir.toString();
      }
      catch (e)
      {
         console.error(`EXCEPTION: `+e);
         return "!!";
      }
   }


   GetTotaliOer(myTeam: boolean): string
   {
      try
      {
         if (myTeam)
            return this.jsonData.myTeam.totali.oerStr.toFixed(1);
         else
            return this.jsonData.oppoTeam.totali.oerStr.toFixed(1);
      }
      catch (e)
      {
         console.error(`EXCEPTION: `+e);
         return "!!";
      }
   }


   GetTotalieFGp(myTeam: boolean): string
   {
      try
      {
         if (myTeam)
            return this.jsonData.myTeam.totali.eFGpStr;
         else
            return this.jsonData.oppoTeam.totali.eFGpStr;
      }
      catch (e)
      {
         console.error(`EXCEPTION: `+e);
         return "!!";
      }
   }


   GetTotaliTSp(myTeam: boolean): string
   {
      try
      {
         if (myTeam)
            return this.jsonData.myTeam.totali.TSpStr;
         else
            return this.jsonData.oppoTeam.totali.TSpStr;
      }
      catch (e)
      {
         console.error(`EXCEPTION: `+e);
         return "!!";
      }
   }


   GetTotaliTL(myTeam: boolean): string
   {
      try
      {
         if (myTeam)
            return this.jsonData.myTeam.totali.tl;
         else
            return this.jsonData.oppoTeam.totali.tl;
      }
      catch (e)
      {
         console.error(`EXCEPTION: `+e);
         return "!!";
      }
   }


   GetTotaliT2(myTeam: boolean): string
   {
      try
      {
         if (myTeam)
            return this.jsonData.myTeam.totali.t2;
         else
            return this.jsonData.oppoTeam.totali.t2;
      }
      catch (e)
      {
         console.error(`EXCEPTION: `+e);
         return "!!";
      }
   }


   GetTotaliT3(myTeam: boolean): string
   {
      try
      {
         if (myTeam)
            return this.jsonData.myTeam.totali.t3;
         else
            return this.jsonData.oppoTeam.totali.t3;
      }
      catch (e)
      {
         console.error(`EXCEPTION: `+e);
         return "!!";
      }
   }


   GetTotaliTC(myTeam: boolean): string
   {
      try
      {
         if (myTeam)
            return this.jsonData.myTeam.totali.tc;
         else
            return this.jsonData.oppoTeam.totali.tc;
      }
      catch (e)
      {
         console.error(`EXCEPTION: `+e);
         return "!!";
      }
   }


   GetTotaliQ1(myTeam: boolean): string
   {
      try
      {
         if (myTeam)
            return this.jsonData.myTeam.totali.q1.dato;
         else
            return this.jsonData.oppoTeam.totali.q1.dato;
      }
      catch (e)
      {
         console.error(`EXCEPTION: `+e);
         return "!!";
      }
   }


   GetTotaliQ2(myTeam: boolean): string
   {
      try
      {
         if (myTeam)
            return this.jsonData.myTeam.totali.q2.dato;
         else
            return this.jsonData.oppoTeam.totali.q2.dato;
      }
      catch (e)
      {
         console.error(`EXCEPTION: `+e);
         return "!!";
      }
   }


   GetTotaliQ3(myTeam: boolean): string
   {
      try
      {
         if (myTeam)
            return this.jsonData.myTeam.totali.q3.dato;
         else
            return this.jsonData.oppoTeam.totali.q3.dato;
      }
      catch (e)
      {
         console.error(`EXCEPTION: `+e);
         return "!!";
      }
   }


   GetTotaliQ4(myTeam: boolean): string
   {
      try
      {
         if (myTeam)
            return this.jsonData.myTeam.totali.q4.dato;
         else
            return this.jsonData.oppoTeam.totali.q4.dato;
      }
      catch (e)
      {
         console.error(`EXCEPTION: `+e);
         return "!!";
      }
   }


   GetTotaliET(myTeam: boolean): string
   {
      try
      {
         if (myTeam)
            return this.jsonData.myTeam.totali.et.dato;
         else
            return this.jsonData.oppoTeam.totali.et.dato;
      }
      catch (e)
      {
         console.error(`EXCEPTION: `+e);
         return "!!";
      }
   }


   GetMatchDate(): string
   {
      let result: string = "";

      try
      {
         result = this.jsonData.match.playDate.substring(0,10);
      }
      catch (e)
      {
         result = "";
      }
      return result;
   }


   GetMatchNumber(): string
   {
      let result: string = "";

      try
      {
         result = this.jsonData.match.number;
      }
      catch (e)
      {
         result = "";
      }
      return result;
   }


   GetMatchHome(): string
   {
      let result: string = "";

      try
      {
         if (this.jsonData.match.home)
            result = "in casa";
         else
            result = "in trasferta";
      }
      catch (e)
      {
         result = "";
      }
      return result;
   }


   GetMatchGiornata(): string
   {
      let result: string = "";

      try
      {
         result = this.jsonData.match.giornata;
      }
      catch (e)
      {
         result = "";
      }
      return result;
   }


   GetMatchLocation(): string
   {
      let result: string = "";

      try
      {
         result = this.jsonData.match.location;
      }
      catch (e)
      {
         result = "";
      }
      return result;
   }


   GetMatchArbitri(): string
   {
      let result: string = "";

      try
      {
         result = this.jsonData.match.referee1;
         if (this.jsonData.match.referee2 != "")
            result += ` - ${this.jsonData.match.referee2}`;
      }
      catch (e)
      {
         result = "";
      }
      return result;
   }


   async exportToPDF()
   {
      const data = document.getElementById('div-tab-tabelle');
      if (!data)
         return;

      // Il pannello del tab potrebbe essere nascosto (display:none).
      // Rendiamo visibile temporaneamente il contenitore del tab per html2canvas.
      const tabPanel = data.closest('.p-tabview-panel');
      const wasHidden = tabPanel && getComputedStyle(tabPanel).display === 'none';
      if (wasHidden && tabPanel)
      {
         (tabPanel as HTMLElement).style.display = 'block';
         (tabPanel as HTMLElement).style.position = 'absolute';
         (tabPanel as HTMLElement).style.left = '-9999px';
      }

      // Rimuovi temporaneamente overflow/altezza fissa dalle tabelle scrollabili
      // perché html2canvas non renderizza il contenuto dentro overflow:hidden
      const scrollWrappers = data.querySelectorAll('.p-datatable-wrapper');
      const savedStyles: { el: HTMLElement; overflow: string; maxHeight: string; height: string }[] = [];
      scrollWrappers.forEach(el =>
      {
         const htmlEl = el as HTMLElement;
         savedStyles.push({
            el: htmlEl,
            overflow: htmlEl.style.overflow,
            maxHeight: htmlEl.style.maxHeight,
            height: htmlEl.style.height
         });
         htmlEl.style.overflow = 'visible';
         htmlEl.style.maxHeight = 'none';
         htmlEl.style.height = 'auto';
      });

      // 1. Trasforma l'HTML in un canvas unico
      const canvas = await html2canvas(data, {
         scale: 2, // Aumenta la qualità per il PDF
         useCORS: true,
         logging: false,
         backgroundColor: '#1e1e2e'  // Sfondo scuro come il tema, così il testo bianco è visibile
      });

      // Ripristina gli stili delle tabelle scrollabili
      savedStyles.forEach(s =>
      {
         s.el.style.overflow = s.overflow;
         s.el.style.maxHeight = s.maxHeight;
         s.el.style.height = s.height;
      });

      // Ripristina la visibilità originale
      if (wasHidden && tabPanel)
      {
         (tabPanel as HTMLElement).style.display = '';
         (tabPanel as HTMLElement).style.position = '';
         (tabPanel as HTMLElement).style.left = '';
      }

      const imgWidth = 297; // Larghezza A4 landscape in mm
      const pageHeight = 210; // Altezza A4 landscape in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF('l', 'mm', 'a4');
      let position = 0;

      // 2. Gestione multipagina (se il grafico è molto lungo)
      let heightLeft = imgHeight;
      const imgData = canvas.toDataURL('image/png');

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0)
      {
         position = heightLeft - imgHeight;
         pdf.addPage();
         pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
         heightLeft -= pageHeight;
      }

      pdf.save('match-tabelle.pdf');
   }

}
