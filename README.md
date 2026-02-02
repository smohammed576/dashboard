# General

- [Get All](#get-all)
- [Get Item](#get-item)
- [Update Item](#update-item)
- [New Item](#new-item)
- [Pagination](#pagination)

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




## Location Amount
Wanneer de workarea lijst ingeladen is staat er onder de naam de workarea altijd ook hoeveel locaties er bij dat workarea horen.
Om te voorkomen om voor elke workarea in de lijst een tweede request te sturen is er in de backend functie die bij elk workarea item het aantal locaties meegeeft.

``` java
dto.setLocations(
    locationRepository.findByWorkAreaId(workArea.getId()).size()
);
```

Als je een locatie verwijdert of toevoegt moet dit aantal ook veranderen. 
Bij het verwijderen van een locatie, door op de verwijder knop te drukken bij het locatie item, wordt deze functie geroepen en wordt gelijk het nieuwe juiste aantal meegegeven om te veranderen in de lijst.

``` dart
workareaListBloc.add(WorkareaEvent.locationAmount(item.copyWith(locations: (item.locations ?? 0) - 1)));
```

Voor dat wordt opgeroepen wordt er wel eerst een call gemaakt naar de [Update Item](#update-item) functie van de ```locationBloc``` omdat hier eerst het ```workareaId``` verwijdert moet worden. Dit zorgt ervoor dat die locatie niet meer bij deze workarea hoort maar wel nog blijft bestaan.

De reden dat dit niet met de [Update Item](#update-item) functie van workarea gebeurd is omdat dit eigenlijk geen deel is van de workarea model.

``` dart
on<_LocationAmount>((event, emit) {
      state.maybeWhen(
        loaded: (workareas, locations) {
          final List<Workarea> list = workareaData.map((item){
            return item.id == event.workarea.id ? event.workarea : item;
          }).toList();
          final data = workareas.copyWith(content: list) as ApiResponse<Workarea>;
          emit(WorkareasLoaded(workareas: data));
        },
        orElse: (){}
      );
    });
```


## Workarea Geometry
Workarea heeft een centerpoint en als de workarea wordt opgeroepen dan staat er op de frontend een kaart waar deze wordt laten zien.
Bij het ophalen van een workarea wordt er ook een request gedaan naar de endpoint om ```workarea geometry``` op te zoeken en als deze bestaat ook op te halen. Als er een geometrie bestaat met in de ```workareaId``` het ```id``` van de gekozen workarea dan wordt deze opgehaalt en weer gegeven op de kaart die terug te vinden is op het scherm van workareas.
Er kunnen nieuwe polygonen worden getekent door op de knop van ```Bewerk geometrie``` te drukken. Er verschijnt dan een dialog waar een kaart op te zien waar er nieuwe polygonen kunnen worden getekent door op de kaart te drukken en punten te zetten. Om de polygon op te slaan moet er eerst op het eerste punt gedrukt worden waardoor de polygon gesloten wordt en dan wordt er een knop blauw op de map.
Als daarop gedrukt wordt dan wordt er een functie geroepen die de 

## Locations In Geometry
De data in de workarea geometrie zijn polygonen en deze worden getekent op de map. Als een workarea geen geometrie heeft dan zijn er op het scherm twee knoppen te zien, als de geometrie wel bestaat dan komt er een derde knop bij, deze heet ```Haal locaties op in geometrie```. Als hierop gedrukt wordt dan komt er een dialog tevoorschijn waar er gekozen kan worden welke ```locatie subtypes```, ```eigenschappen```, ```onderhoudsplichte``` deze locaties mogen hebben. Als er niets wordt gekozen dan wordt er gezocht naar de locaties met ```null``` als values.
Dit wordt naar de endpoint gestuurd.

``` dart
${NetworkUtils.getBaseUrl()}/$endpoint/workareas/filter?organisationId=$organisationId&workAreaId=$workareaId&subtypes=${subtypes.join(",")}&properties=${properties.join(",")}&maintainers=${maintainers.join(",")}
```

Deze wordt naar de backend gestuurd waar het de volgende query uitvoert:

``` java
@Query(
value = """
        SELECT l.id
        FROM locations l 
        JOIN workarea_work_area_geometries geometry
            ON ST_Contains(geometry.geometry, ST_SetSRID(l.latlng, 4326))
        LEFT JOIN location_properties props ON props.location_id = l.id
        WHERE l.organisation_id = :organisationId
            AND geometry.workarea_id = :workAreaId
            AND (:subtypes IS NULL OR l.sub_type IS NULL OR cardinality(:subtypes) = 0 OR l.sub_type = ANY(:subtypes))
            AND (:properties IS NULL OR props.property_id IS NULL OR cardinality(:properties) = 0 OR props.property_id = ANY(:properties))
            AND (:maintainers IS NULL OR l.maintainer IS NULL OR cardinality(:maintainers) = 0 OR l.maintainer = ANY(:maintainers))
        """,
nativeQuery = true
)
```

Hier wordt er gezocht naar de locatie die aan de eisen voldoen. Door de ```ST_Contains()``` wordt er voor gezorgt dat de locaties in de gekozen geometrie zitten en dat er door die locaties gefiltered moet worden. Als dit is gebeurd dan worden deze locaties teruggestuurd en wordt er eerst gecontrolleerd of er wel locaties zijn. Als dat zo is dan gaan ze in een loop en worden de ```workareaId``` bij elke locatie veranderd naar het ```id``` van de workarea.

``` java
for(Location location : locations){
    location.setWorkArea(workArea);
}
locationRepository.saveAll(locations);
locations.forEach(l ->
        result.add(locationMapper.toGetDto(l))
);
```

Deze worden dan opgeslagen en in de frontend wordt dit opnieuw opgehaald om alle nieuwe locaties te kunnen zien op het scherm.

