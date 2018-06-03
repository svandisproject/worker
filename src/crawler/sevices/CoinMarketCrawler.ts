import {HttpService, Injectable} from "@nestjs/common";
import {Observable} from "rxjs/index";
import {CoinMarketGlobalConfig} from "../dataModel/CoinMarketGlobalConfig";
import {Ticker} from "../dataModel/Ticker";
import {AxiosResponse} from "@nestjs/common/http/interfaces/axios.interfaces";
import {map, switchMap} from "rxjs/internal/operators";

@Injectable()

export class CoinMarketCrawler {

    private readonly API_URL = 'https://api.coinmarketcap.com/v2';

    constructor(private httpService: HttpService) {

    }

    public execute() {
        // this.getGlobalConfig().pipe(
        //     map((config) => this.getPages(config.data.data.active_cryptocurrencies))
        // )
        // axios.get('https://api.coinmarketcap.com/v2/global')
        //     .then(res => {
        //
        //         for(let n = 0; n < pages; n++){
        //             axios.get('https://api.coinmarketcap.com/v2/ticker?start=' + (n * 100))
        //                 .then((res) => {
        //                     for(let key in res.data.data) {
        //                         if(res.data.data.hasOwnProperty(key)) {
        //                             axios.post(`${config.API_URL}/api/asset`, {
        //                                 asset: AssetFactory.buildAsset(res.data.data[key])
        //                             })
        //                                 .then((resp) => {
        //                                     console.log(resp.data);
        //                                 })
        //                                 .catch((error) => {
        //                                     console.log(error.response.headers);
        //                                 })
        //                         }
        //                     }
        //                 });
        //         }
        //     });
    }

    private getGlobalConfig(): Observable<AxiosResponse<CoinMarketGlobalConfig>> {
        return this.httpService.get(this.API_URL + '/global');
    }

    private getTickerStartFrom(start: number): Observable<AxiosResponse<Ticker[]>> {
        return this.httpService.get(this.API_URL + '/ticker?start=' + String(start));
    }

    private getPages(activeCryptoCur: number): number {
        return Math.ceil(activeCryptoCur / 100);
    }
}