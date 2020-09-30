# Progetto di Visualizzazione delle informazioni 
Gli open data sono dati liberamente accessibili a tutti e che si richiamano al più ampio concetto di open government, che consente a tutti i cittadini di afferire, supportati dalle nuove tecnologie, alle informazioni della pubblica amministrazione partecipando direttamente al processo decisionale.
Lo scopo di questo progetto è l'utilizzo di alcuni dataset, integrati da varie sorgenti, per consentire un'analisi del fenomeno attraverso un'interfaccia Web.


## I dataset 
I dataset sono:
* Incidenti stradali nel territorio di Roma Capitale (Fonte https://dati.comune.roma.it/catalog/dataset): Il dataset contiene l'elenco degli incidenti stradali che sono avvenuti nel territorio di Roma Capitale di Gennaio 2020.
* Municipi di Roma Capitale (Fonte http://www.datiopen.it/it/opendata/Municipi_di_Roma_Capitale)


## Avvio dell'applicativo
Per avviare l'applicativo bisogna eseguire comando seguente all'interno della directory principale:
	`npm run build`
    `http-server ./dist`


## Visualizzazione degli incidenti su mappa
La prima parte del progetto è dedicata alla visualizzazione degli incidenti su mappa. I dati sono stati rappresentati con:
* Municipi: layer poligonale dei confini amministrativi dei municipi di Roma Capitale
* Incidenti: layer puntuale che rappresenta il singolo incidente
* Cluster Map : layer puntuale che consente la visualizzazione degli incidenti clusterizzata per una migliore user experience nella navigazione della mappa
* Classified Map : layer poligonale, costruito attraverso un'analisi spaziale degli incidenti che ricadono all'interno del poligono municipio
* Heat Map : Rappresentazione cartografica della densità degli incidenti su mappa


## Visualizzazione della distribuzione su Barchart
Al fine di offrire anche una visualizzazione grafica oltre che cartografica, sono stati implentati i seguenti 3 istogrammi:
*Distribuzione incidenti per municipio
*Distribuzione incidenti per giorno
*Distribuzione incidenti per fascia oraria


## Osservazioni
La realizzazione di uno strumento cartografico ha consentito un'analisi del fenomeno "incidenti" su base territoriale. In particolare, il layer incidenti consente di localizzare il punto dove l'incidente è avvenuto e accedere alle informazioni alfanumeriche. 
La vista "clusterizzata" consente una migliore navigazione della mappa. La vista "classificata" fornisce un'immediata visualizzazione del fenomeno su base municipio. 
La HeatMap evidenzia quali sono le zone di maggiore densità dove si manifesta il fenomeno.
Questo strumento, assieme a dati di sintesi illustrati tramite card (Numero totale di incidenti, Distribuzione per genere e Distribuzione per condizioni asfalto) e all'utilizzo di istogrammi,ha permesso una lettura analitica delle caratteristiche dei dati e della loro distribuzione. 


## Librerie utilizzate
* Qgis
* D3.js
* Oper Layer
* Bootstrap
* jQuery
