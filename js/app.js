//Restaurants coordinates
var initRestaurants = [
  { title: 'Marius Degustare', lat: -22.9619942, lng: -43.166399},
  { title: 'Momo Gelato', lat: -22.9671399, lng: -43.178647},
  { title: 'Mamma Jamma', lat: -22.9657875, lng: -43.218171},
  { title: 'Alfaia', lat: -22.9667074, lng: -43.1817557},
  { title: 'Refeitorio Organico', lat: -22.9534364, lng: -43.1866068},
  { title: 'Eccellenza', lat: -22.9571868, lng: -43.1958403},
  { title: 'T.T. Burguer', lat: -22.9871381, lng: -43.1910002},
  { title: 'Olympe', lat: -22.9612137, lng: -43.2066858},
  { title: 'Zuka', lat: -22.9840911, lng: -43.2274836},
  { title: 'Zaza Bistro Tropical', lat: -22.9854689, lng: -43.2048377},
];
//global variables
var map;
const responseContainer = document.querySelector('#response-container');
var infoWindowOpened = '';
var lastClickedRestaurant = '';
var Restaurant = function(restaurants) {
  var self = this;
  self.title = restaurants.title;
  self.searchTitle = restaurants.title.toLowerCase();
  //url foursquare search
  var url = 'https://api.foursquare.com/v2/venues/search?'+ '&ll=' + restaurants.lat + ',' + restaurants.lng+ '&v=20180120'+ '&intent=global&query=' + restaurants.title    + '&client_id=' + 'ID5IELTFHJDDCGKFODHHLOMTZ1RRYOOEPPFLL31FTGXDXL05'+ '&client_secret=' + 'NHXSJPKCNXCRRM2YZVSW22ZNO0UIV054HKPHTL3JJRFBFEHF';
  //Foursquare request Venue Search
  fetch(url)
    .then(response => response.json())
    .then(loaddata) //load venue search
    .then(loadphoto) //and then load venue photo
    .catch(err => requestError('restaurant')); 
  
  function loaddata(data){
    //Response Fourquare fields
    data = data.response.venues[0];
    self.category = data.categories[0].shortName;
    self.address = data.location.formattedAddress.join(', ');
    self.phone = data.contact.formattedPhone;
    self.usersCount = data.stats.usersCount;
    self.tipCount = data.stats.tipCount;
    self.web = data.url;
    self.id = data.id;
    }

  function loadphoto(){
    //url foursquare photo
    var urlphoto = 'https://api.foursquare.com/v2/venues/' + self.id + '/photos?'+ '&limit=1'+ '&v=20180120'+ '&client_id=' + 'ID5IELTFHJDDCGKFODHHLOMTZ1RRYOOEPPFLL31FTGXDXL05'+ '&client_secret=' + 'NHXSJPKCNXCRRM2YZVSW22ZNO0UIV054HKPHTL3JJRFBFEHF';
    //Foursquare request photos
    fetch(urlphoto)
      .then(response => response.json())
      .then(photos)
      .catch(err => requestError('photo'));
    function photos(dataphoto){
      //get suffix and prefix of foursquare photos
      self.prefix = dataphoto.response.photos.items[0].prefix;
      self.suffix = dataphoto.response.photos.items[0].suffix;
      }
  }
   //Google Maps marker position 
   self.marker = new google.maps.Marker({
    map: map,
    position: new google.maps.LatLng(restaurants.lat, restaurants.lng),
    title: self.title
  });

  //open window info with restaurant data
  self.marker.addListener('click', function() {
    if (infoWindowOpened) {
      infoWindowOpened.close();
    }
    var cancelBouncingMarker = function() {
      lastClickedRestaurant.setAnimation(null);
      lastClickedRestaurant = null;
    };
    if (lastClickedRestaurant) {
      cancelBouncingMarker();
    }
    var infoWindowRestaurantData = [
      '<div class="info-window">',
        '<h2>', self.title, '</h2>',
        '<h3>', self.phone, '</h3>',
        '<p>',  self.category, '</p>',
        '<p>', self.address, '</p>',
        '<p>',
          'This place has been visited by <strong>', self.usersCount, '</strong> people, ',
          'who made <strong>', self.tipCount ,'</strong> tips.',
        '</p>',
        '<h4>',self.web,'</h4>',
      '<img src="', self.prefix, '100x100', self.suffix,'">',
      '</div>'
    ];
    //Google Map InfoWindow and animation
    var infoWindow = new google.maps.InfoWindow({ content: infoWindowRestaurantData.join('') });
    infoWindowOpened = infoWindow;
    infoWindow.open(map, self.marker);
    self.marker.setAnimation(google.maps.Animation.BOUNCE);
    lastClickedRestaurant = self.marker;
    google.maps.event.addListener(infoWindow, 'closeclick', cancelBouncingMarker);
  });

  self.selectLocation = function() {
    google.maps.event.trigger(self.marker, 'click');
  };

};
// error function for foursquare api
function requestError(part) {
  responseContainer.insertAdjacentHTML(alert(`Wow! There was an error making a request for one ${part}`));
}

// handle error message for google maps api
function googleMapsError() {
  alert('There was an error with Google Maps.');
};

//knockout view
var AppViewModel = function() {
  var self = this;

  this.searchRestaurant = ko.observable('');
  this.locationsList = ko.observableArray();

  map = new google.maps.Map(document.getElementById('mapRJ'), {
    center: { lat: -22.9646877, lng: -43.2027327 },
    zoom: 14
  });
  //assign init restaurants info to Restaurant
  initRestaurants.forEach(function(info) {
    var location = new Restaurant(info);
    self.locationsList.push(location);
  });
 //filter list data
  this.filteredList = ko.computed(function() {
    return this.locationsList().filter(function(location) {
      var isIncluded = location.searchTitle.indexOf(this.searchRestaurant().toLowerCase()) !== -1;
      location.marker.setVisible(isIncluded);
      return isIncluded;
    }, this);
  }, this);
};
//init function
function init() {
  ko.applyBindings(new AppViewModel());
}
