import { Component } from '@angular/core';
import { ScraperService } from './services/scraper.service';
import * as moment from 'moment';

import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'EasyJobSearch-angular';
  job = '';
  location = '';
  progressWidth='-1%'
  progressRefresh=null;
  qjob=''
  qlocation=''
  statusData=null;
  startTime=moment().format("DD/MM/YYYY HH:mm:ss");
  elapsedTime='0';


  constructor(private _scrservice: ScraperService, private http: HttpClient
    ) { }

ngOnInit(){

  // this.resetProgress();

}

  goScraper() {
    this.startTime=moment().format("DD/MM/YYYY HH:mm:ss");
    this.progressWidth='-1%'
    this.progressRefresh= setInterval(()=>{

        // console.log(data);
        // this.progressWidth=data['progress']+'%'
        this.progressCalc();
        if(this.progressWidth=='100%'){
          clearInterval(this.progressRefresh)
        }
    },1000)
    if(this.job==''){
      this.job='sviluppatore web'
      this.location='gallipoli'
    }
    this._scrservice.scraperSearch(this.job,this.location).subscribe((data)=>{console.log(data);}, (err)=>{clearInterval(this.progressRefresh)})
    this.qjob=this.job;
    this.qlocation=this.location;
  }
  resetFields(){
    this.job=''
    this.location='';
    this.resetProgress();
    this.http.get('http://localhost:3000/delete').subscribe(() => {})
    if(this.progressRefresh){
      clearInterval(this.progressRefresh)
    }

    window.location.reload();
  }

  resetProgress(){
    this.progressWidth='-1%'
    return this.http.get('http://localhost:3000/resetProgress').toPromise()
    }


    progressCalc(){
      this.http.get('http://localhost:3000/progress').subscribe(data => {
        console.log(data);
        // this.progressWidth=data['progress']+'%'

        let value = (this.evaluatePartialPercentage(data['doneLinkedin'],data['totalLinkedin'],data['hasFinishedLinkedin'])+
        this.evaluatePartialPercentage(data['doneGlassdoor'],data['totalGlassdoor'],data['hasFinishedGlassdoor'])+
        this.evaluatePartialPercentage(data['doneMonster'],data['totalMonster'],data['hasFinishedMonster'])
        )*(1/3)*100
        console.log(value)
        this.progressWidth= parseInt(value.toString()).toString()+'%';
        this.statusData=data;



    })

}


evaluatePartialPercentage(done,total,finished){
  if(finished==1){
    return 1
  }
  else if (total==0)
  {
    return 0
  }
  else{ return done/total}
}

totalItems(){
  if(this.statusData!=null)
  {return this.statusData.totalLinkedin + this.statusData.totalGlassdoor + this.statusData.totalMonster}
  else{return 0}
}

exists(v)
{
  if(v>0){
    return 1
  }
  else {return 0}
}

getDiffTime(start){
  if(this.progressWidth=='100%')
  {
    var ms = moment(moment().format("DD/MM/YYYY HH:mm:ss"),"DD/MM/YYYY HH:mm:ss").diff(moment(start,"DD/MM/YYYY HH:mm:ss"));
    var d = moment.duration(ms);
    // var s = Math.floor(d.asHours()) + moment.utc(ms).format(":mm:ss");
    var s = Math.floor(d.asHours()) + 'h'+ moment.utc(ms).format(":mm") + 'm'+ moment.utc(ms).format(":ss")+'s';
    this.elapsedTime=s;
    return this.elapsedTime;
  }
  var ms = moment(moment().format("DD/MM/YYYY HH:mm:ss"),"DD/MM/YYYY HH:mm:ss").diff(moment(start,"DD/MM/YYYY HH:mm:ss"));
  var d = moment.duration(ms);
  // var s = Math.floor(d.asHours()) + moment.utc(ms).format(":mm:ss");
  var s = Math.floor(d.asHours()) + 'h '+ moment.utc(ms).format(": mm") + 'm '+ moment.utc(ms).format(": ss")+'s ';
  this.elapsedTime=s;
  return this.elapsedTime;
}


}
