//making object to display the different rating and likes taken from Foursquare place id
//venueId can be found on the Foursquare page form the searched URL
var placesData = [{
        title: 'Bannerghatta National Park',
        location: {
            lat: 12.800285,
            lng: 77.577047
        },
        show: true,
        selected: false,
        venueId: '4bf7af228d30d13a3163ff17'
    },
    {
        title: 'Lalbagh Botanical Garden',
        location: {
            lat: 12.950743,
            lng: 77.584777
        },
        show: true,
        selected: false,
        venueId: '4b5ee0ccf964a5201b9c29e3'
    },
    {
        title: 'Vidhana Soudha',
        location: {
            lat: 12.979462,
            lng: 77.590909
        },
        show: true,
        selected: false,
        venueId: '4c04b63439d476b09ddb31a7'
    },
    {
        title: 'Cubbon Park',
        location: {
            lat: 12.976347,
            lng: 77.592928
        },
        show: true,
        selected: false,
        venueId: '4bbc4513e45295217db855a4'
    },
    {
        title: 'Tipu Sultan\'s Summer Palace',
        location: {
            lat: 12.959342,
            lng: 77.573625
        },
        show: true,
        selected: false,
        venueId: '4d561f78611aa35da9963d39'
    },
    {
        title: 'Visvesvaraya Technological Museum',
        location: {
            lat: 12.975226,
            lng: 77.596345
        },
        show: true,
        selected: false,
        venueId: '4cb9476423a4199cf14bed89'
    },
    {
        title: 'Jawaharlal Nehru Planetarium ',
        location: {
            lat: 12.984731,
            lng: 77.589489
        },
        show: true,
        selected: false,
        venueId: '4cc3d4d79141370467fcbe55'
    },
    
    {
        title: 'Bangalore Fort ',
        location: {
            lat: 12.962901,
            lng: 77.576046
        },
        show: true,
        selected: false,
        venueId: '5017c32ae4b0ce712b1c2b11'
    }

];
// using knoclout js for the implementation
//check the documentation of knockoutJS to understand the keywords used.
var model = function(){
    var global = this;
    global.errorDisplay = ko.observable('');
    global.mapArray = [];

    for (var i = 0; i < placesData.length; i++) {
        var place = new google.maps.Marker({
            position: {
                lat: placesData[i].location.lat,
                lng: placesData[i].location.lng
            },
            map: map,
            title: placesData[i].title,
            show: ko.observable(placesData[i].show),
            selected: ko.observable(placesData[i].selected),
            venueid: placesData[i].venueId, // venue id used for foursquare
            animation: google.maps.Animation.DROP
        });

        global.mapArray.push(place);
    }

    // function for animation to make markers bounce but stop after 600ms
    global.Bounce = function(marker) {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            marker.setAnimation(null);
        }, 1500);
    };

    // function to add API information to each marker
    //making AJAX request to the Foursquare page to get the Likes and rating for the places.
    //Kindly replace the Key values with your Own Key to avoid any illegal activitys.
    global.addApiInfo = function(marker) {
        $.ajax({
            url: "https://api.foursquare.com/v2/venues/" + marker.venueid + '?client_id=A0RQGD4P1KEFNMJHHB0THD0H2C51OLRNWU42FN1D2AQD1SU5&client_secret=XOUFIOCM2A2XTAM5SSFPT3WBXNHLAL40PTFP3KVGXYZBDMII&v=20180323',
            dataType: "json",
            success: function(data) {
                // stores result to display the likes and ratings on the markers
                var result = data.response.venue;

                // to add likes and ratings to marker
                marker.likes = result.hasOwnProperty('likes') ? result.likes.summary : '';
                marker.rating = result.hasOwnProperty('rating') ? result.rating : '';
            },

            // warn if there is error in recievng json
            error: function(e) {
                global.errorDisplay("Foursquare data is unavailable. Please try again later.");
            }
        });
    };

    //function to add information about API to the markers
    var addMarkerInfo = function(marker) {

        //add API items to each marker
        global.addApiInfo(marker);

        //add the click event listener to marker
        marker.addListener('click', function() {
            //set this marker to the selected state

            global.setSelected(marker);
        });
    };

    //  iterate through mapArray and add marker api info  
    for (var i = 0; i < global.mapArray.length; i++) {
        addMarkerInfo(global.mapArray[i]);
    }

    // create a searchText for the input search field
    global.searchText = ko.observable('');


    //every keydown is called from input box
    global.filterList = function() {
        //variable for search text
        var currentText = global.searchText();
        infowindow.close();

        //list for user search
        if (currentText.length === 0) {
            global.setAllShow(true);
        } else {
            for (var i = 0; i < global.mapArray.length; i++) {
                // to check whether the searchText is there in the mapArray
                if (global.mapArray[i].title.toLowerCase().indexOf(currentText.toLowerCase()) > -1) {
                    global.mapArray[i].show(true);
                    global.mapArray[i].setVisible(true);
                } else {
                    global.mapArray[i].show(false);
                    global.mapArray[i].setVisible(false);
                }
            }
        }
        infowindow.close();
    };

    // to show all the markers
    global.setAllShow = function(marker) {
        for (var i = 0; i < global.mapArray.length; i++) {
            global.mapArray[i].show(marker);
            global.mapArray[i].setVisible(marker);
        }
    };
    // function to make all the markers unselected 
    global.setAllUnselected = function() {
        for (var i = 0; i < global.mapArray.length; i++) {
            global.mapArray[i].selected(false);
        }
    };

    global.currentLocation = global.mapArray[0];

    // function to make all the markers selected and show the likes and ratings

    global.setSelected = function(location) {
        global.setAllUnselected();
        location.selected(true);

        global.currentLocation = location;
	//Many search quary won't work as Foursquare api requires paid account and they have limit on the request made per day.
	
        Likes = function() {
            if (global.currentLocation.likes === '' || global.currentLocation.likes === undefined) {
                return "Likes not available or Request Quota exceeded";
            } else {
                return "Location has " + global.currentLocation.likes;
            }
        };
        // function to show rating and if not then no rating to display
        Rating = function() {
            if (global.currentLocation.rating === '' || global.currentLocation.rating === undefined) {
                return "Ratings not  available or Request Quota exceeded";
            } else {
                return "Location is rated " + global.currentLocation.rating;
            }
        };
	//Displaying the Likes and Rating in the Info Window 
        var InfoWindow = "<h5>" + global.currentLocation.title + "</h5>" + "<div>" + Likes() + "</div>" + "<div>" + Rating() + "</div>";

        infowindow.setContent(InfoWindow);

        infowindow.open(map, location);
        global.Bounce(location);
    };
};
