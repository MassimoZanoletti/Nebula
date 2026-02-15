


import { Injectable } from '@angular/core';
import { Observable} from "rxjs";
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DbServService
{

   public wsIp: string = "localhost";
   public wsPort: number = 3210;

   constructor(private http: HttpClient)
   { }


   private Endpoint(): string
   {
      return `http://${this.wsIp}:${this.wsPort}`;
   }


   public GetMatchHeaderList(): Observable<any>
   {
      return this.http.get<any>(this.Endpoint()+"/api/matchlist/MatchHeader");
   }


   public GetMatchHeader(mhId: number): Observable<any>
   {
      return this.http.get<any>(this.Endpoint()+`/api/data/MatchHeader/${mhId}`);
   }


   public GetMatchQuarters(mhId: number): Observable<any>
   {
      return this.http.get<any>(this.Endpoint()+`/api/quarters/${mhId}`);
   }


}
