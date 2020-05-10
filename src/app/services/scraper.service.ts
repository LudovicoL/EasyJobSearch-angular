import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { serverUrl } from '../globals/globals';

@Injectable({
  providedIn: 'root'
})
export class ScraperService {

  constructor(private http: HttpClient) { }

  scraperSearch(job,location){
    var headers = new HttpHeaders({'Content-Type': 'application/json'});
    console.log(job); console.log(location)
    if(job==null || job==''){
      job='falegname';
      location='lecce;'
    }
    return this.http.post(serverUrl+'/scraper',{mestiere: job, localita: location },{headers:headers})

  }


}

