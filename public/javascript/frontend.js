var foursquareURL = "https://api.foursquare.com/v2/venues/suggestcompletion?" + "client_id=EBA5MTZIPRVHNGKU2RB4KZ45J2BAOZFSYIXHGYBGR1KIXFIQ&" + "client_secret=K0CBX5TQKHNEB35MGT3NNIVLWP0C4L0CQQ4UP3C2LUSLQL0W&" + "v=20130725&" + "limit=10&" + "near=Bangalore&" + "query=%QUERY";
 
function parseFoursquareResponse(res) {
  $('#loader').removeClass('loading');
  console.log(res.response.minivenues);
  return res.response.minivenues;
};

function renderContent(loc) {

  document.title = "Headto - " + loc.name;

  //address: "2 Church St."
  //city: "Bengaluru"
  //country: "India"
  //crossStreet: ""
  //lat: 12.974386636007539
  //lng: 77.60735750198364
  //postalCode: "560001"
  //state: "Karnataka"

  var result = "";
  result += '<div>';
  result += '<strong>' + loc.categories[0].name + '</strong>';
  result += '<p>' + loc.location.address + ', ' + loc.location.city + '.</p>';
  result += '<p><a class="btn btn-lg btn-primary" id="postHeadto">I\'m heading here</a></p>';
  result += '</div>';
  result += '<img src="//a.tiles.mapbox.com/v3/paramaggarwal.map-mkz04dpf/pin-m-star';
  result += '(' + loc.location.lng + ',' + loc.location.lat + ')';
  result += '/' + loc.location.lng + ',' + loc.location.lat + ',14/400x200.png">';

  $(".result").html(result);

  $('#postHeadto').click(function() {
    postHeadto(loc.id);
  });

}

function postHeadto(venueID) {
  alert("Ready to post! ID: " + venueID);

  FB.getLoginStatus(function(response) {
      if (response.status === 'connected') {
        // the user is logged in and has authenticated your
        // app, and response.authResponse supplies
        // the user's ID, a valid access token, a signed
        // request, and the time the access token 
        // and signed request each expire
        // var uid = response.authResponse.userID;
        // var accessToken = response.authResponse.accessToken;
        console.log("User is already logged in, posting to Facebook");
        postGraphAction(venueID);

      } else if (response.status === 'not_authorized') {
        // the user is logged in to Facebook, 
        // but has not authenticated your app
        FB.login(function(response) {
         if (response.authResponse) {
           console.log('Welcome!  Fetching your information.... ');
           FB.api('/me', function(response) {
             console.log('Good to see you, ' + response.name + '.');
           });
           postGraphAction(venueID);
         } else {
           console.log('User cancelled login or did not fully authorize.');
         }
       }, {scope: 'email, publish_actions'});
      } else {
        // the user isn't logged in to Facebook.
        FB.login(function(response) {
         if (response.authResponse) {
           console.log('Welcome!  Fetching your information.... ');
           FB.api('/me', function(response) {
             console.log('Good to see you, ' + response.name + '.');
             postGraphAction(venueID);
           });
         } else {
           console.log('User cancelled login or did not fully authorize.');
         }
       }, {scope: 'email, publish_actions'});
      }
    });
}

function postGraphAction(venueID) {
  var venueURL = "/venue/" + venueID;

  FB.api(
    'me/headtoapp:head_to',
    'post',
    {
      venue: venueURL,
      expires_in : 4*60*60
    },
    function(response) {
      if (!response) {
       console.log('Error occurred.');
     } else if (response.error) {
       console.log('Error: ' + response.error.message);
     } else {
       console.log('<a href=\"https://www.facebook.com/me/activity/' + response.id + '\">' +
         'Story created.  ID is ' + response.id + '</a>');
       window.location.assign("https://www.facebook.com/me/activity/" + response.id)
     }
   });
}

$(document).ready(function() {
  $('.typeahead').typeahead({
    name: 'headtoapp-search',
    valueKey: 'name',
    remote: {
      url: foursquareURL,
      filter: parseFoursquareResponse,
      cache: true,
      beforeSend: function () {
        $('#loader').addClass('loading');
      }
    },
    template: [
      '<div class="venue-icon"><img src="{{categories.0.icon.prefix}}bg_44{{categories.0.icon.suffix}}" /></div>',
      '<div class="venue-name">{{name}}</div>',
      '<div class="venue-address">{{location.address}}<br>{{location.crossStreet}}</div>',
      ].join(''),
    engine: Hogan
  });

  $(document).on("typeahead:selected", function(e, loc) {
    var locationSuffix = "/venue/" + loc.id;

    //Push only if already not on same page to avoid redundancy
    if(window.location.href.indexOf(locationSuffix) == -1)
      window.history.pushState(loc, null, locationSuffix);

    renderContent(loc);
  });

  window.addEventListener("popstate", function(e) {
    if(e.state) {
      renderContent(e.state);
      $("input.typeahead").val(e.state.name);
    }
  });

});