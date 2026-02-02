# General

[Get All](#get-all)
[Get Item](#get-item)
[Update Item](#update-item)
[New Item](#new-item)
[Pagination](#pagination)

## Standaard functies

## Get All

Boven aan de bloc staat een lege list die bijvoorbeeld ```workareaData``` of ```locationData``` heet. Deze gebruik je in de ```GetAll``` functie. Als je die functie oproept krijg je altijd een ```pageIndex``` mee. Dit 
Get All workarea zorgt ervoor dat je alle items krijgt die bij jouw organisation hoort. Stel je hoort bij organisatie 3 dan krijg je alle items van 3. Er zit een pagination op deze endpoint om te voorkomen dat je niet opeens honderden items tegelijkertijd ophaalt. De limit op de pagination is 50. Hiervoor heb je de data list en sturen we een index.


> [Dit is hoe het uitgebreid werkt met de pagination](#pagination)


---

## Get Item

Wanneer je op een lijst item drukt op je scherm wordt het ```id``` van dat item gepakt en gestuurd naar een bloc functie. 
Deze stuurt het ```id``` dan naar een endpoint die er zo kan uitzien: 
``` dart 
${NetworkUtils.getBaseUrl()}/$endpoint/$id
```

Deze haalt dan het item op en die stuur je vervolgens terug.


## Update Item

De update (of patch) functie wordt gebruikt wanneer er verandering wordt gebracht aan het item. Als je de naam bijvoorbeeld aanpast dan wordt er deze bloc functie uitgevoerd.
Als je deze functie aanroept moet je altijd je item meegeven met de nieuwe waardes. Dit kan heel makkelijk omdat er gebruik wordt gemaakt van ```ApiResponse```. Hierdoor kan je het simpel doen door in de ```copyWith``` de waarde aan te passen.

``` dart
onChanged: (value) => workareaDetailsBloc.add(WorkareaEvent.updateWorkarea(workarea.copyWith(name: value))),
```

Op deze manier wordt de nieuwe data meegestuurd en wordt dan een call gemaakt naar een endpoint dat er bijvoorbeeld zo uitziet.

``` dart
final response = await getIt.get<ViaAppiaHttpClient>().patch(
  '${NetworkUtils.getBaseUrl()}/$endpoint',
  headers: NetworkUtils.getAuthHeaders(),
  body: location.toModel().toJson()
);
```

Dit stuurt dan een ```200 statusCode``` terug, wat betekent dat dit succesvol is verlopen.
Hierna wordt vervolgens ook de data list geupdate zodat alle data overal blijft kloppen zonder alles opnieuw te moeten laden.

Dit gebeurd weer in de bloc.
Er wordt eerst gezocht naar het item met dezelfde ```id```. Wanneer deze gevonden is vervangt het de data van dat item naar de nieuwe data, en dan wordt de lijst data teruggestuurd.

``` dart
emit(WorkareaLoaded(workarea: workarea));
final listBloc = getIt<WorkareaBloc>(instanceName: "WorkareaListBloc");
final listState = listBloc.state;

if(listState is WorkareasLoaded){
  final List<Workarea> data = listState.workareas.content.map((item){
    return item.id == workarea.id ? workarea : item as Workarea;
  }).toList();
  final newList = listState.workareas.copyWith(content: data) as ApiResponse<Workarea>;
  listBloc.emit(WorkareasLoaded(workareas: newList));
}
```

## New Item

In de front end staat er in de ```AppBar``` een plus knop. Als je hierop drukt komt er een model tevoorschijn waar je vervolgens een naam kunt invullen. Als dit is gebeurd kan je op de knop met bijvoorbeeld ```Bevestigen``` drukken en dan wordt de naam naar een bloc functie gestuurd waar nieuwe items gemaakt worden. 
De bloc stuurt die naam vervolgens naar de respository implementation waar dan eerst een api call wordt gemaakt naar een andere endpoint, namelijk de endpoint om de users ```organisationsId``` op te halen. Wanneer dit gelukt is wordt uiteindelijk een ```POST request``` gemaakt naar de juiste endpoint.

``` dart
final organisationId = await organisationDatasource.getUserOrganisationId();
final results = await remoteDatasource.getAllWorkareas(organisationId, pageIndex);
```

Wanneer dit is gebeurd wordt het nieuwe aangemaakte item teruggegeven naar de bloc en wordt de lijst opnieuw opgeroepen.




## Pagination

In het begin is de ```pageIndex``` standaard 0 en wanneer dit wordt gestuurd wordt dit gecontroleerd in de functie, als de index 0 is dan wordt de data lijst altijd geleegd om te voorkomen dat je dezelfde data opnieuw krijgt wanneer je de page sluit en opnieuw opent.

``` dart
if(event.pageIndex == 0){
  workareaData.clear();
  const WorkareaLoading();
}
```

Als je dus je eerste request maakt (gebeurt standaard bij openen van de page) dan krijg je de eerste 50 items. Deze worden in de data lijst gestopt en worden opgeslagen.
Daarna vervang je de content die je terug krijgt met de response met de data in de lijst. 
Dit doen we zodat je alle data van de vorige page nog kan zien. Hierna wordt dit teruggestuurd en kan je het zien in de lijst op het scherm.
Hieronder staat een voorbeeld van de workarea bloc.

``` dart
workareaData.addAll(results.content as List<Workarea>);
final ApiResponse<Workarea> workareas = results.copyWith(content: workareaData) as ApiResponse<Workarea>;
emit(WorkareasLoaded(workareas: workareas));
```

Als je in de lijst op het scherm helemaal naar beneden scrollt en de bodem raakt dan wordt je ```pageIndex``` verhoogd. Wanneer dit gebeurd wordt er een functie geroepen in de ```initState``` en daar wordt eerst gecontrolleerd of er nog volgende paginas zijn.
Als de ```pageIndex``` hetzelfde is als de ```totalPages``` dan gebeurd er niets, zoniet dan wordt de ```getAll``` functie opnieuw geroepen met de veranderde index.

``` dart
void callMoreWorkareas(){
  if(workareaBloc.state.maybeWhen(loaded: (workareas, locations) => workareas.totalPages, orElse: () => 0) != pageIndex){
    workareaBloc.add(WorkareaEvent.getAllWorkareas(pageIndex));
  }
}
```
