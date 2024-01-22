import $ from "jquery";
import donenv from "dotenv";

donenv.config();


mapboxgl.accessToken = process.env.MAPBOX_ACCESS_TOKEN;
var style = process.env.MAPBOX_STYLE;

//***** IE11 Hack ******//
var isIE11 = !!window.MSInputMethodContext && !!document.documentMode;
if (isIE11) {
  var isIE11_LoadCount;
  if(!(localStorage.getItem('isIE11_LoadCount'))) {
    isIE11_LoadCount = 1;
    localStorage.setItem('isIE11_LoadCount', isIE11_LoadCount);
  } else {
    isIE11_LoadCount = localStorage.getItem('isIE11_LoadCount');
    localStorage.setItem('isIE11_LoadCount', ++isIE11_LoadCount);
  }
  if(isIE11_LoadCount !== 1) {
    $(document).ready(() => {
      map.setStyle(style);
      map.on('load', () => {
        isIE11_LoadCount = 1;
        localStorage.setItem('isIE11_LoadCount', isIE11_LoadCount);
      });
    })
  }
}

var map = new mapboxgl.Map({
  container: 'map',
  style: style, 
  zoom: 2,
  // pitch: 35,
  center: [-45, 0],
  minZoom: 2,
  maxZoom: 4.5,
  attributionControl: false
});

const mapNav = new mapboxgl.NavigationControl();

var flyThruActive = true;
// $('#btnSidePanelClose').on('click touchend', () => {
//   startMapExplore();
// });
$('#close_overlay').on('click touchend', () => {
  startMapExplore();
});
map.on("mousedown", function() {
  startMapExplore();
});

function preventDefault(e){
  e.preventDefault();
}

map.on("touchstart", function() {
  $('body').addClass('no-scroll');
  document.body.addEventListener('touchmove', preventDefault, { passive: false });
});

map.on("touchend", function() {
  startMapExplore();
  $('body').removeClass('no-scroll');
  document.body.removeEventListener('touchmove', preventDefault, { passive: false });
});

map.on('error', () => {
  console.log('Map Error');
});

map.on('load', () => {
  document.getElementById("loading-spinner-overlay").classList.add('hide');

  let mq = window.matchMedia("screen and (min-width: 1024px)");
  if(mq.matches){
    //flyThruActive = true;
    flyThru(0);
  } else {
    map.easeTo({ zoom: 2, pitch: 35, duration: 1000 });
  }
  
  
  // loadStoryIcons(0);
  if(dataMarkers.length > 0) {
    for (let i = dataMarkers.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      let temp = dataMarkers[i];
      dataMarkers[i] = dataMarkers[j];
      dataMarkers[j] = temp;
    }
  }
  popDataMarkers(0);
});

$("#story-window button.close").on('click touchend', () => {
  $("#story-window").removeClass('show');
});

function loadStoryIcons(index) {
  $(storyLocations[index]).find('.marker-point').removeClass("scale0"); 
  index = index + 1;
  if(index < storyLocations.length) {
    setTimeout(() => { 
      loadStoryIcons(index); 
    }, 1000);
  }
}

function popDataMarkers(index) {
  $(dataMarkers[index]).find('.marker-point').removeClass("scale0"); 
  index = index + 1;
  if(index < dataMarkers.length) {
    setTimeout(() => { 
      popDataMarkers(index); 
    }, 10);
  }
}

function flyThru(index) {
  if (flyThruActive) {
    map.flyTo({
      center: [
        storyLocations[index].dataset.long,
        storyLocations[index].dataset.lat
      ],
      zoom: 3.2,
      offset: [160, 0],
      speed: 0.25
    });
    map.once("moveend", function() {
      // $(storyLocations[index]).addClass('selected');
      setTimeout(function() {
        // $(storyLocations[index]).removeClass("selected");
        index = index < storyLocations.length - 1 ? index + 1 : 0;
        flyThru(index);
        
      }, 3000);
    });
  }
}

var myPlayer,
  playerHTML,
  playerData = {
    accountId: "1384193102001",
    playerId: "NJgI8K0ie",
    videoId: "5627198461001"
  };

const dataMarkers = [];

var markerData = $.getJSON("@__PATHVAR__@js/countries_data.json", function(data) {
  data.countries_data.forEach(function(marker) {
    var el = document.createElement("div");
    el.className = "marker data-marker";
    $(el).append(infoboxTemplate(marker));
    $(el).on("mouseenter", function() {
      trackEvent.event("link", {
        "lpos": "map blade",
        "lid": "hover",
        "linktext": marker.Country_State_Province
      });
    });
    new mapboxgl.Marker(el).setLngLat(marker.geometry.coordinates).addTo(map);
    dataMarkers.push(el);
    $(el).find('.marker-point').on("click touchend", function() {
      $(".marker").removeClass("selected");
      $(el).addClass("selected");
      trackEvent.event("link", {
        "lpos": "map blade",
        "lid": "click", 
        "linktext": marker.Country_State_Province
      });
      $(el).find("button.close").on("click touchend", () => { closeMarkerInfo(); });
      map.flyTo({
        center: marker.geometry.coordinates,
        offset: [160, 0],
        speed: 0.75,
        zoom: 4.2
      });
    });
  });
});

var stateMarkerData = $.getJSON("@__PATHVAR__@js/state_province_data.json", function(data) {
  data.state_province_data.forEach(function(marker) {
    var el = document.createElement("div");
    el.className = "marker data-marker";
    $(el).append(infoboxTemplate(marker));
    $(el).on("mouseenter", function() {
      trackEvent.event("link", {
        "lpos": "map blade",
        "lid": "hover",
        "linktext": marker.Country_State_Province
      });
    });
    new mapboxgl.Marker(el).setLngLat(marker.geometry.coordinates) .addTo(map);
    dataMarkers.push(el);
    $(el).find('.marker-point').on("click touchend", function() {
      $(".marker").removeClass("selected");
      $(el).addClass("selected");
      trackEvent.event("link", {
        "lpos": "map blade",
        "lid": "click", 
        "linktext": marker.Country_State_Province
      });
      $(el).find("button.close").on("click touchend", () => { closeMarkerInfo() });
      map.flyTo({
        center: marker.geometry.coordinates,
        offset: [160, 0],
        speed: 0.75,
        zoom: 4.2
      });
    });
  });
});

let storyLocations = [];
let storyData = $.getJSON("@__PATHVAR__@js/story_data.json", (data) => {
  data.story_data.forEach((marker) => {
    let el = document.createElement("div");
    el.className = "marker story-marker";
    el.id = "marker_" + marker.id;
    el.dataset.lat = marker.geometry.coordinates[1];
    el.dataset.long = marker.geometry.coordinates[0];
    $(el).on("mouseenter", function() {
      trackEvent.event("link", {
        "lpos": "map blade",
        "lid": "hover",
        "linktext": marker.name
      });
    });
    $(el).html(`
      <div class="marker-point img-wrapper">
        <img src="${marker.mapIconUrl}" alt=""/>
      </div>
      <div id="${"infobox_" + marker.id}" class="marker-infobox">
        <button class="close">&nbsp;</button>
        <h3>${marker.name}</h3>
        <h4>${marker.location}</h4>
        <button class="full-story">${marker.cta}</button>
      </div>
    `);
    new mapboxgl.Marker(el).setLngLat(marker.geometry.coordinates).addTo(map);
    storyLocations.push(el);
    $("#marker_" + marker.id + " .img-wrapper").on("click touchend", () => {
      $(".marker").removeClass("selected");
      $(el).addClass("selected");
      trackEvent.event("link", {
        "lpos": "map blade",
        "lid": "click", 
        "linktext": marker.name
      });
      $(el).find("button.close").on("click touchend", () => { closeMarkerInfo() });
      map.flyTo({
        center: marker.geometry.coordinates,
        offset: [160, 0],
        speed: 0.75
      });
      $("#infobox_" + marker.id + " .full-story").on('click touchend', () => {
        displayStory(marker);
      });
      
    });
  });
}).done(() => {
  if(window.location.hash) {
    for(var i in storyData.responseJSON.story_data){
      if(storyData.responseJSON.story_data[i].id === window.location.hash.substring(1)) {
        startMapExplore();
        displayStory(storyData.responseJSON.story_data[i]);        
      }
    }
  }
});


function startMapExplore() {
  if (flyThruActive) {
    flyThruActive = false;
    map.flyTo({
      center: [-45, 0],
      zoom: 2,  
      pitch: 35,
      speed: 0.25
    });
  }
  
  $('#map .map-overlay').addClass("hidden");
  setTimeout(function() {
    $('#map .map-overlay').css({'display':'none'});
    createExitMapBtn();
  }, 500);
  $('#explore').addClass("hidden");
  map.addControl(mapNav, 'top-right');
  $('.mapboxgl-ctrl-zoom-in').on('click touchend', () => {
    trackEvent.event("link", {
       "lpos": "map blade",
       "lid": "click",
       "linktext": "zoom in"
    });
  });
  $('.mapboxgl-ctrl-zoom-out').on('click touchend', () => {
    trackEvent.event("link", {
       "lpos": "map blade",
       "lid": "click",
       "linktext": "zoom out"
    });
  });
  $('.mapboxgl-ctrl-compass').on('click touchend', () => {
    trackEvent.event("link", {
       "lpos": "map blade",
       "lid": "click",
       "linktext": "rotate"
    });
  });
}

function displayStory(data) {
  $("#story-window .story-content").html(storyDrawerTemplate(data));
  trackEvent.event("link", {
    "lpos": "map blade",
    "lid": "click", 
    "linktext": data.cta
  });
  $('.story-content').scrollTop(0);
  if(data.videoId) {
    let bcPlayer;
    $('#story-window .video-lightbox').html(`
      <button class="close">&nbsp;</button>
      <video id="${data.id}_video" data-video-id="${data.videoId}"  data-account="${data.videoDataAcctId ? data.videoDataAcctId : playerData.accountId}" data-player="${data.videoPlayerId ? data.videoPlayerId: playerData.playerId}" data-embed="default" class="video-js" controls></video>
    `);
    $('.video-lightbox button.close').on('click touchend', () => {
      $('.video-lightbox').removeClass('active');
      bcPlayer = videojs(data.id + "_video"); 
      bcPlayer.pause();
      $('#story-window script').remove();
    });
    let s = document.createElement("script");
    s.src = `//players.brightcove.net/${data.videoDataAcctId ? data.videoDataAcctId : playerData.accountId}/${data.videoPlayerId ? data.videoPlayerId: playerData.playerId}_default/index.min.js`;
    $("#story-window").append(s);
    s.onload = () => { console.log("brightcove video script loaded") };
    $("#" + data.id + "_videolink").on('click touchend', () => {
      $('.video-lightbox').addClass('active');
      bcPlayer = videojs(data.id + "_video"); 
      bcPlayer.play();
    });
  }
  $("#story-window").addClass('show');
  $(".marker").removeClass("selected");
}

function closeMarkerInfo() {
  map.easeTo({ zoom: 2.5, duration: 1000 });
  $(".marker").removeClass("selected");
}

function infoboxTemplate(data){ 
  return `
    <div class="marker-point scale0"></div>
    <div class="marker-info">
      <button class="close">&nbsp;</button>
      <h3>${data.Country_State_Province}</h3>
      <div class="">${data.TotalCurrentStudentEnrollment ? parseInt(data.TotalCurrentStudentEnrollment).toLocaleString() + " students currently enrolled" : ""}</div>
      <div class="flex-row">${data.CurrentPercentFemaleEnrollment ? `<span class="badge">${(parseFloat(data.CurrentPercentFemaleEnrollment) * 100).toFixed(1)}%</span> Female students enrolled` : ""}</div>
      <div class="flex-row">${data.TotalStudentsSinceInception ? `${parseInt(data.TotalStudentsSinceInception) > 999 ? `<span class="badge">${Math.round(parseInt(data.TotalStudentsSinceInception) / 1000)}k</span> <span class=""> Total students since inception</span>` : `<span class="badge">${data.TotalStudentsSinceInception}</span> <span class=""> Total students since inception</span>`}` : ""}</div>
      <div class="flex-row">${data.CiscoCertificationsSinceInception ? `${parseInt(data.CiscoCertificationsSinceInception) > 999 ? `<span class="badge">${Math.round(parseInt(data.CiscoCertificationsSinceInception) / 1000)}k</span> <span class=""> Total certifications since inception</span>` : `<span class="badge">${data.CiscoCertificationsSinceInception}</span> <span class=""> Total certifications since inception</span>`}` : ""}</div>
    </div>
  `;
}

function storyDrawerTemplate(data) {
  return `
    <div class="student-info">
      <div class="img-wrapper">
        <img src="${data.mapIconUrl}" alt=""/>
      </div>
      <div class=title-wrapper>
        <h2>${data.name}</h2>
        <h4>Location: ${data.location}</h4>
      </div>
    </div>
    <div class="student-story">
      <div class="story-wrapper">
        ${data.pullQuote ? `
          <h3 class="pullquote">${data.pullQuote}</h3>
        ` : ''}
        ${data.videoId ? `
          <div id="${data.id}_videolink" class="videolink">
            <img src="${data.videoBgImgUrl}" alt=""/>
          </div>
        ` : ''}
        ${!data.videoId && data.bodyImgUrl ? `
          <img src="${data.bodyImgUrl}" alt=""/>
        ` : ''}
        <h2>${data.headline}</h2>
        <div>${data.body}</div>
      </div>
    </div>
  `;
}

const one = document.getElementById('digit-place1');
const ten = document.getElementById('digit-place2');
const hundred = document.getElementById('digit-place3');
const oneK = document.getElementById('digit-place4');
const tenK = document.getElementById('digit-place5');
const hundredK = document.getElementById('digit-place6');
const oneM = document.getElementById('digit-place7');
// const fy2018start = Date.parse('July 30, 2017 00:00:00 GMT+00:00');
const fy2018start = 1501372800000;
// const fy2019start = Date.parse('July 30, 2018 00:00:00 GMT+00:00');
const fy2019start = 1532908800000;
// const fy2020start = Date.parse('July 30, 2019 00:00:00 GMT+00:00');
const fy2020start = 1564444800000;
const est2018Enrollment = 1610486;
const est2019Enrollment = 1900000;
const est2020Enrollment = 2200000;
let enrollmentRate;
let enrollmentNow;
let loadTime = Date.now();

if(fy2018start < loadTime){
  enrollmentRate = est2018Enrollment / 365 / 24 / 60 / 60 / 1000;
  enrollmentNow = Math.floor((loadTime - fy2018start) * enrollmentRate);
}
if(fy2019start < loadTime){
  enrollmentRate = est2019Enrollment / 365 / 24 / 60 / 60 / 1000;
  enrollmentNow = Math.floor((loadTime - fy2019start) * enrollmentRate);
}
if(fy2020start < loadTime){
  enrollmentRate = est2020Enrollment / 365 / 24 / 60 / 60 / 1000;
  enrollmentNow = Math.floor((loadTime - fy2020start) * enrollmentRate);
}

let counterDigits = enrollmentNow.toString().split("").reverse();
let oneStartVal = counterDigits[0] ? parseInt(counterDigits[0]) : 0;
let tenStartVal = counterDigits[1] ? parseInt(counterDigits[1]) : 0;
let hundredStartVal = counterDigits[2] ? parseInt(counterDigits[2]) : 0;
let oneKStartVal = counterDigits[3] ? parseInt(counterDigits[3]) : 0;
let tenKStartVal = counterDigits[4] ? parseInt(counterDigits[4]) : 0;
let hundredKStartVal = counterDigits[5] ? parseInt(counterDigits[5]) : 0;
let oneMStartVal = counterDigits[6] ? parseInt(counterDigits[6]) : 0;

let oneScrollVal = oneStartVal * 100;
let tenScrollVal = tenStartVal * 100;
let hundredScrollVal = hundredStartVal * 100;
let oneKScrollVal = oneKStartVal * 100;
let tenKScrollVal = tenKStartVal * 100;
let hundredKScrollVal = hundredKStartVal * 100;
let oneMScrollVal = oneMStartVal * 100;

$(document).ready(() => {
  gapScroll(0)
  one.style.cssText = "transform: translateY(-" + oneScrollVal + "%)"; 
  ten.style.cssText = "transform: translateY(-" + tenScrollVal + "%)"; 
  hundred.style.cssText = "transform: translateY(-" + hundredScrollVal + "%)"; 
  oneK.style.cssText = "transform: translateY(-" + oneKScrollVal + "%)"; 
  tenK.style.cssText = "transform: translateY(-" + tenKScrollVal + "%)"; 
  hundredK.style.cssText = "transform: translateY(-" + hundredKScrollVal + "%)"; 
  oneM.style.cssText = "transform: translateY(-" + oneMScrollVal + "%)"; 
  window.requestAnimationFrame(animateCounter);
  counterTick(oneScrollVal);  
});

function gapScroll(index){
  let gaps = $('.gap-wrapper>div').toArray();
  let prev = index === 0 ? gaps.length - 1 : index - 1; 
  let next = index < gaps.length - 1 ? index + 1 : 0;
  $(gaps[prev]).removeClass('active');
  $(gaps[index]).removeClass('next').addClass('active');
  $(gaps[next]).addClass('next');
  index = next;
  setTimeout(() => {
    gapScroll(index);
  }, 4200);
}

function counterTick(index) {
  setTimeout(() => {
    index = index < 999 ? index + 1 : 0;
    oneScrollVal = index;
    if(oneScrollVal > 900) {
      tenScrollVal = (tenStartVal * 100) + (oneScrollVal - 900);
    }
    if(oneScrollVal === 0 && (tenScrollVal - (tenStartVal * 100)) === 99 ) {
      tenStartVal = tenStartVal < 9 ? tenStartVal + 1 : 0;
      tenScrollVal = tenStartVal * 100;
    }
    if (tenScrollVal > 900) {
      hundredScrollVal = (hundredStartVal * 100) + (tenScrollVal - 900);
    }
    if ((tenScrollVal % 100) === 0 && (hundredScrollVal - (hundredStartVal * 100)) === 99) {
      hundredStartVal = hundredStartVal < 9 ? hundredStartVal + 1 : 0;
      hundredScrollVal = hundredStartVal * 100;
    }
    if (hundredScrollVal > 900) {
      oneKScrollVal = oneKStartVal * 100 + (hundredScrollVal - 900);
    }
    if (hundredScrollVal % 100 === 0 && oneKScrollVal - oneKStartVal * 100 === 99) {
      oneKStartVal = oneKStartVal < 9 ? oneKStartVal + 1 : 0;
      oneKScrollVal = oneKStartVal * 100;
    }
    if (oneKScrollVal > 900) {
      tenKScrollVal = tenKStartVal * 100 + (oneKScrollVal - 900);
    }
    if (oneKScrollVal % 100 === 0 && tenKScrollVal - tenKStartVal * 100 === 99) {
      tenKStartVal = tenKStartVal < 9 ? tenKStartVal + 1 : 0;
      tenKScrollVal = tenKStartVal * 100;
    }
    if (tenKScrollVal > 900) {
      hundredKScrollVal = hundredKStartVal * 100 + (tenKScrollVal - 900);
    }
    if (tenKScrollVal % 100 === 0 && hundredKScrollVal - hundredKStartVal * 100 === 99) {
      hundredKStartVal = hundredKStartVal < 9 ? hundredKStartVal + 1 : 0;
      hundredKScrollVal = hundredKStartVal * 100;
    }
    if (hundredKScrollVal > 900) {
      oneMScrollVal = oneMStartVal * 100 + (hundredKScrollVal - 900);
    }
    if (hundredKScrollVal % 100 === 0 && oneMScrollVal - oneMStartVal * 100 === 99) {
      oneMStartVal = oneMStartVal < 9 ? oneMStartVal + 1 : 0;
      oneMScrollVal = oneMStartVal * 100;
    }
    counterTick(index);
  }, 50);
}

function animateCounter() {
  one.style.cssText = "transform: translateY(-" + oneScrollVal + "%)";
  ten.style.cssText = "transform: translateY(-" + tenScrollVal + "%)"; 
  hundred.style.cssText = "transform: translateY(-" + hundredScrollVal + "%)";
  oneK.style.cssText = "transform: translateY(-" + oneKScrollVal + "%)";
  tenK.style.cssText = "transform: translateY(-" + tenKScrollVal + "%)";
  hundredK.style.cssText = "transform: translateY(-" + hundredKScrollVal + "%)";
  oneM.style.cssText = "transform: translateY(-" + oneMScrollVal + "%)"; 
  window.requestAnimationFrame(animateCounter);
}

function openMapOverlay() {
  $('#map .map-overlay').css({'display':'block'});
  $('#map .map-overlay').removeClass("hidden");
  $('.mapboxgl-ctrl-top-right').empty();
}

function createExitMapBtn() {
  var btn = $('#map_exit_btn')[0];
  if(btn == undefined) {
    btn = `<button id="map_exit_btn" class="mapboxgl-ctrl-icon exit" type="button" aria-label="Exit">Exit map</button>`;
    $('.mapboxgl-ctrl.mapboxgl-ctrl-group').prepend(btn);
  }
}

$('body').on('click touchend', '#map_exit_btn', () => {
  openMapOverlay();
});