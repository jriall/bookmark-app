//VARIABLE SETUP

let urlList = startingData.slice();
let selectedPage = 0;
let pages;
let xmlhttp = new XMLHttpRequest();

//FUNCTION DECLARATIONS

//turn the loading spinner on or off
function toggleSpinner() {
  document.getElementById('spinner').classList.toggle('hidden');
  document.getElementById('content').classList.toggle('hidden');
}

//switches between the results page and the main content page
function toggleResultsPage() {
  document.getElementById('results').classList.toggle('hidden');
  document.getElementById('overview').classList.toggle('hidden');
}

//function to change page number on clicking page number
function changePage(num) {
  if (num !== selectedPage) {
    selectedPage = num;
    getLinkList();
  }
}

//helper function to get the current number of pages
function getNumberOfPages() {
  pages = Math.ceil(urlList.length / 20) || 1;
}

//clearing the backgrounds then highlighting the currently selected page
function changeLinkBackgrounds() {
  let pageNumbers = document.getElementsByClassName('page-number');
  Array.prototype.forEach.call(
    pageNumbers,
    a => (a.style['background-color'] = 'transparent')
  );
  document.getElementById(`page-number-${selectedPage + 1}`)
    .style['background-color'] = 'rgba(255, 255, 255, 0.1)';
}

function deleteLink(num) {
  urlList.splice(num, 1);
  getNumberOfPages();
  if (selectedPage >= pages) {
    selectedPage--;
  }
  getPageNumbers();
  getLinkList();
}

//
function resetView() {
  selectedPage = 0;
  getPageNumbers();
  getLinkList();
}

//VIEW GENERATION FUNCTIONS

//generate the views for the page numbers dynamically
function getPageNumbers() {
  getNumberOfPages();
  let pageNumberList = '';
  for (let i = 0; i < pages; i++) {
    const pageNumber = `
      <button
          class='page-number'
          id='page-number-${i + 1}'
          onclick=changePage(${i})
      >
        ${i + 1}
      </button>
    `;
    pageNumberList += pageNumber;
  }
  document.getElementById('page-numbers').innerHTML = pageNumberList;
}

//generating the links dynamically
function getLinkList() {
  let linkList = '';
  for (let i = selectedPage * 20; i < selectedPage * 20 + 20; i++) {
    const link = `
      <li class='link-li'>
        <button
            class='delete-button'
            id='delete-button-${i}'
            onclick=deleteLink(${i})
        >
          <img src='images/trash-can.png'>
        </button>
          <a href='${urlList[i]}'target='_blank'>
            <button class='link-button'>
              <img src='images/link.png'>
            </button>
          </a>
        <p
            contenteditable='true'
            id='link-${i}'
            class='link-item'
        >
          ${urlList[i]}
        </p>
      </li>
    `;
    if (urlList[i]) {
      linkList += link;
    }
  }
  document.getElementById('link-list').innerHTML = linkList;
  changeLinkBackgrounds();
}

//EVENT HANDLERS

//reset data and reload test data
document.getElementById('load-sample-data').addEventListener(
  'click',
  function() {
    localStorage.removeItem('updatedData');
    urlList = startingData.slice();
    window.scroll(0, 0);
    //use a fake load for 500ms to make the user experience a little less jumpy on reset 🤷‍
    setTimeout(function() {
      toggleSpinner();
    }, 500);
    toggleSpinner();
    resetView();
  },
  false
);

//clear all data from the app and from localStorage
document.getElementById('clear-data').addEventListener(
  'click',
  function() {
    localStorage.removeItem('updatedData');
    urlList = [];
    window.scroll(0, 0);
    resetView();
  },
  false
);

//incrementing or decrementing the page number by arrow buttons
document.getElementById('increment').addEventListener(
  'click',
  function() {
    if (selectedPage < pages - 1) {
      selectedPage++;
      getLinkList();
    }
  },
  false
);

document.getElementById('decrement').addEventListener(
  'click',
  function() {
    if (selectedPage > 0) {
      selectedPage--;
      getLinkList();
    }
  },
  false
);

//listen for changes to contenteditable elements and update data accordingly
let editable = document.getElementsByClassName('link-item');

Array.prototype.forEach.call(editable, a => {
  a.addEventListener('input', function() {
    let idToChange = this.getAttribute('id').split('-')[1];
    urlList[idToChange] = this.innerHTML;
  });
});

//back button returning us to the overview page
document
  .getElementById('overview-page-link')
  .addEventListener('click', function(e) {
    e.preventDefault();
    toggleResultsPage();
  });

//firing off the get request to determine if the site exists or not.
document.getElementById('add-url-form').addEventListener('submit', function(e) {
  e.preventDefault();
  let newURL = document.getElementById('input-url').value;
  toggleSpinner();
  xmlhttp.open('GET', `https://cors-anywhere.herokuapp.com/${newURL}`, true);
  xmlhttp.send();
});

//HTTP REQUEST HANDLING

//Custom checking if URL exists. This function seems a bit unwieldy, so I'd probably look to abstracting view changes out.
//Would also be easier to make the HTTP request logic more easily resuable, for example checking whether an edited URL exists.
xmlhttp.onreadystatechange = function() {
  if (xmlhttp.readyState === XMLHttpRequest.DONE) {
    toggleSpinner();
    //use cors anywhere as local dev server was having cors problems making cross-origin requests
    let parsedURL = this.responseURL.replace('https://cors-anywhere.herokuapp.com/','');
    document.getElementById('new-url').innerHTML = parsedURL;
    toggleResultsPage();
    if (xmlhttp.status === 200) {
      if (urlList.indexOf(parsedURL) > -1) {
        //don't add if the URL already exists in the list
        document.getElementById('result-message').innerHTML =
          'That URL already exists in the list!';
        document.getElementById('add-url-form').reset();
      } else {
        //adding to the list if URL isn't in the list already
        document.getElementById('result-message').innerHTML =
          'Thank you for submitting a new URL! 👊';
        urlList.push(parsedURL);
        getNumberOfPages();
        selectedPage = pages - 1;
        getPageNumbers();
        getLinkList();
      }
    } else {
      //Handle case where URL does not exist
      document.getElementById('result-message').innerHTML =
        'The following URL does not exist or is currently unreachable 😢<br> Try again.';
    }
  }
};

//PERSISTING DATA ACROSS BROWSER REFRESHES

//load data from localStorage
window.onload = function() {
  if (localStorage.updatedData) {
    urlList = JSON.parse(localStorage.getItem('updatedData'));
  }
};

//save data to localStorage on refresh of browser
window.onbeforeunload = function() {
  if (typeof Storage !== 'undefined') {
    localStorage.setItem('updatedData', JSON.stringify(urlList));
  } else {
    console.log('Browser cannot persist data across page refresh :(');
  }
};

//PAGE LOAD FUNCTION CALLS

getPageNumbers();
getLinkList();
