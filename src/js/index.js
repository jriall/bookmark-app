let urlList = startingData.slice();
let selectedPage = 0;
let pages;

//load data from localStorage or from test object if it does not exist yet
window.onload = () => {
  if (localStorage.updatedData) {
    urlList = JSON.parse(localStorage.getItem("updatedData"));
  }
};

//save data to localStorage on refresh of browser
window.onbeforeunload = function() {
  localStorage.setItem("updatedData", JSON.stringify(urlList));
};

//reset data and reload test data
document.getElementById("reset-data").addEventListener(
  "click",
  function() {
    localStorage.removeItem("updatedData");
    urlList = startingData.slice();
    window.scroll(0, 0);
    //use a fake load for 500ms to make the user experience a little less jumpy on reset 🤷‍
    setTimeout(function() {
      document.getElementById("spinner").classList.toggle("hidden");
      document.getElementById("content").classList.toggle("hidden");
    }, 500);
    document.getElementById("spinner").classList.toggle("hidden");
    document.getElementById("content").classList.toggle("hidden");
    selectedPage = 0;
    getPageNumbers();
    getLinkList();
  },
  false
);

//function to change page number on clicking page number
function changePage(num) {
  if (num !== selectedPage) {
    selectedPage = num;
    getLinkList();
  }
}

//incrementing or decrementing the page number by arrow buttons
document.getElementById("increment").addEventListener(
  "click",
  function() {
    if (selectedPage < pages - 1) {
      selectedPage++;
      getLinkList();
    }
  },
  false
);

document.getElementById("decrement").addEventListener(
  "click",
  function() {
    if (selectedPage > 0) {
      selectedPage--;
      getLinkList();
    }
  },
  false
);

//generating the pagination links dynamically

function getNumberOfPages() {
  pages = Math.ceil(urlList.length / 20);
}

function getPageNumbers() {
  getNumberOfPages();
  let pageNumberList = "";
  for (let i = 0; i < pages; i++) {
    const pageNumber = `
    <button class="page-number" id="page-number-${i +
      1}" onclick=changePage(${i})>
      ${i + 1}
    </button>
  `;
    pageNumberList += pageNumber;
  }
  document.getElementById("page-numbers").innerHTML = pageNumberList;
}

getPageNumbers();

//generating the links dynamically
function getLinkList() {
  let linkList = "";
  for (let i = selectedPage * 20; i < (selectedPage * 20) + 20; i++) {
    const link = `
      <li class="link-li">
        <button class="delete-button" id="delete-button-${i}" onclick=deleteLink(${i})><img src="images/trash-can.png"></button>
        <button class="link-button"><a href="${urlList[
          i
        ]}" target="_blank"><img src="images/link.png"></a></button>
        <p contenteditable="true" id="link-${i}" class="link-item">${urlList[
      i
    ]}</p>
      </li>
    `;
    if (urlList[i]) {
      linkList += link;
    }
  }
  document.getElementById("link-list").innerHTML = linkList;
  changeLinkBackgrounds();
}

getLinkList();

//clearing the backgrounds then highlighting the currently selected page
function changeLinkBackgrounds() {
  let pageNumbers = document.getElementsByClassName("page-number");
  Array.prototype.forEach.call(
    pageNumbers,
    a => (a.style["background-color"] = "transparent")
  );
  document.getElementById(`page-number-${selectedPage + 1}`).style[
    "background-color"
  ] =
    "rgba(255, 255, 255, 0.1)";
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

//back button returning us to the overview page
document
  .getElementById("overview-page-link")
  .addEventListener("click", function(e) {
    e.preventDefault();
    document.getElementById("results").classList.toggle("hidden");
    document.getElementById("overview").classList.toggle("hidden");
  });

//listen for changes to contenteditable elements and update data accordingly
let editable = document.getElementsByClassName("link-item");
Array.prototype.forEach.call(editable, a => {
  a.addEventListener("input", function() {
    let idToChange = this.getAttribute("id").split("-")[1];
    urlList[idToChange] = this.innerHTML;
  });
});

//firing off the get request to determine if the site exists or not.
document.getElementById("add-url-form").addEventListener("submit", function(e) {
  e.preventDefault();
  let newURL = document.getElementById("input-url").value;
  document.getElementById("spinner").classList.toggle("hidden");
  document.getElementById("content").classList.toggle("hidden");
  xmlhttp.open("GET", `https://cors-anywhere.herokuapp.com/${newURL}`, true);
  xmlhttp.send();
});

//custom checking if URL exists
var xmlhttp = new XMLHttpRequest();

xmlhttp.onreadystatechange = function() {
  if (xmlhttp.readyState === XMLHttpRequest.DONE) {
    document.getElementById("spinner").classList.toggle("hidden");
    document.getElementById("content").classList.toggle("hidden");
    let parsedURL = this.responseURL.replace(
      "https://cors-anywhere.herokuapp.com/",
      ""
    );
    document.getElementById("new-url").innerHTML = parsedURL;
    document.getElementById("results").classList.toggle("hidden");
    document.getElementById("overview").classList.toggle("hidden");
    if (xmlhttp.status === 200) {
      //Handle case where URL exists
      document.getElementById("result-message").innerHTML =
        "Thank you for submitting a new URL! 👊";
      urlList.push(parsedURL);
      document.getElementById("add-url-form").reset();
      getNumberOfPages();
      selectedPage = pages - 1;
      getPageNumbers();
      getLinkList();
    } else {
      //Handle case where URL does not exist
      document.getElementById("result-message").innerHTML =
        "The following URL does not exist 😢<br> Try again.";
    }
  }
};
