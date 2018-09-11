import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { NetworkInterface } from '@ionic-native/network-interface';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/timeout';

import { HomePage } from '../home/home';

@Component({
  selector: 'page-scan',
  templateUrl: 'scan.html'
})
export class ScanPage {
  scanning: boolean = true;
  counter: number = 255;
  components: Array<{ componentType: string, componentName: string, state?: boolean, address: string, actionI?: string, actionO?: string, websocketPort?: string, connection?: boolean }>;
  showLogs: boolean = false;
  logs: string = '';
  msg: string = 'Não foram encontrados componentes!';
  timeout: number = 3000;

  constructor(public navCtrl: NavController, public navParams: NavParams, private networkInterface: NetworkInterface, public http: Http) {
    this.components = [];

    this.networkInterface.getWiFiIPAddress().then(
      net => {
        this.scanNetwork(net);
      },
      err => {
        this.logs += 'Sem rede para procurar!\n';
        this.msg = 'Sem rede para procurar!\n';
        this.scanning = false;
        console.error('Error:', err);
      }
    );
  }

  scanNetwork(net) {
    const ipRange = net.ip.split('.');
    for (let index = 1; index <= 255; index++) {
      this.http.get('http://' + ipRange[0] + '.' + ipRange[1] + '.' + ipRange[2] + '.' + index + '/scan').timeout(this.timeout).map((res: Response) => res.json()).subscribe(
        data => {
          if (data.componentType) {
            this.logs += 'success: ' + ipRange[0] + '.' + ipRange[1] + '.' + ipRange[2] + '.' + index + '\n';
            data.address = ipRange[0] + '.' + ipRange[1] + '.' + ipRange[2] + '.' + index;
            this.components.push(data);
          }
          else {
            this.logs += 'fail: ' + ipRange[0] + '.' + ipRange[1] + '.' + ipRange[2] + '.' + index + '\n';
          }
          this.counter--;
          if (!this.counter) this.scanning = false;
        },
        err => {
          this.logs += 'fail: ' + ipRange[0] + '.' + ipRange[1] + '.' + ipRange[2] + '.' + index + '\n';
          this.counter--;
          if (!this.counter) this.scanning = false;
          console.error('Error:', err);
        }
      );
    }
  }

  goToRoot() {
    this.navCtrl.setRoot(HomePage);
  }

  toggleLogs() {
    this.showLogs = !this.showLogs;
  }

  addComponent(component) {
    const storedComponents = localStorage.getItem('Components') ? JSON.parse(localStorage.getItem('Components')) : [];
    storedComponents.push(component);
    localStorage.setItem('Components', JSON.stringify(storedComponents));
  }

}
