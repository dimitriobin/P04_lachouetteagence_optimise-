class Lightbox {
  static init() {
    const portfolio = document.getElementById("bloc-4-portfolio");
    const links = Array.from(portfolio.querySelectorAll("a[data-lightbox]"));
    const gallery = links.map((link) => link.dataset);
    links.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        new Lightbox(e.currentTarget.dataset, gallery);
      });
    });
  }

  constructor(data, gallery) {
    // Save the element that open the modal for return to it when the user close the modal
    this.previousActiveElement = document.activeElement;
    // Define instance properties
    this.dataset = data;
    this.gallery = gallery;
    this.element = this.buildDOM(data);
    this.setFocusable();
    // Put the modal in the DOM
    document.body.appendChild(this.element);
    // Deal with keyboard events
    this.onKeyDown = this.onKeyDown.bind(this);
    document.addEventListener("keydown", this.onKeyDown);
    // Trap the user in the modal, it can't go in the parent element anymore
    this.trap(true);
    // Set the focus inside the modal
    this.firstFocusable.focus();
  }

  buildDOM(data) {
    const dom = document.createElement("div");
    dom.classList.add("modal", "show");
    dom.setAttribute("tabindex", -1);
    dom.setAttribute("role", "dialog");

    dom.innerHTML = `
      <div class="modal-dialog" role="document" aria-labeled="modalTitle">
        <div class="modal-content">
          <div class="modal-header">
            <button class="close-lightbox" data-dismiss="modal" aria-label="Fermer la fenêtre modale"><span aria-hidden="true">&times;</span></button>
            <h4 id="modalTitle" class="modal-title">${data.caption}</h4>
          </div>
          <div class="modal-body">
            <button class="prev-lightbox" aria-label="précédent" tabindex="0"><span aria-hidden="true" class="fa fa-chevron-left"></span></button>
            <img
              src="${data.lightbox}"
              class="img-responsive portfolio-thumb mx-auto"
              alt="${data.caption}"
              title="${data.caption}"
            />
            <button class="next-lightbox" aria-label="suivant" tabindex="0"><span aria-hidden="true" class="fa fa-chevron-right"></span></button>
          </div>
        </div>
      </div>
    `;

    dom
      .querySelector(".close-lightbox")
      .addEventListener("click", this.close.bind(this));
    dom
      .querySelector(".prev-lightbox")
      .addEventListener("click", this.prev.bind(this));
    dom
      .querySelector(".next-lightbox")
      .addEventListener("click", this.next.bind(this));

    if (this.gallery[0] === data) {
      dom.querySelector(".prev-lightbox").remove();
    }
    if (this.gallery[this.gallery.length - 1] === data) {
      dom.querySelector(".next-lightbox").remove();
    }
    return dom;
  }

  setFocusable() {
    this.focusable = this.element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    this.firstFocusable = this.focusable[0];
    this.lastFocusable = this.focusable[this.focusable.length - 1];
  }

  onKeyDown(e) {
    const firstElement = this.gallery[0] === this.dataset;
    const lastElement = this.gallery[this.gallery.length - 1] === this.dataset;
    switch (e.key) {
      case "Escape":
        this.close(e);
        break;

      case "Tab":
        this.loop(e);
        break;

      case !firstElement && "ArrowLeft":
        this.prev(e);
        break;

      case !lastElement && "ArrowRight":
        this.next(e);
        break;

      default:
        break;
    }
  }

  close(e) {
    e.preventDefault();
    // wait for fade out animation, then remove the modal from the DOM
    this.element.classList.add("fade");
    window.setTimeout(() => {
      this.element.parentElement.removeChild(this.element);
    }, 500);
    // Set off the trap
    this.trap(false);
    // Come back to where the user was when it opened the modal
    this.previousActiveElement.focus();

    // Remove eventListeners for memory purposes
    document.removeEventListener("keydown", this.onKeyDown);
  }

  next(e) {
    e.preventDefault();
    let index = this.gallery.findIndex((item) => item === this.dataset);
    // Set the next element datas as the current one
    this.dataset = this.gallery[index + 1];
    this.updateDOM(this.dataset);
  }

  prev(e) {
    e.preventDefault();
    let index = this.gallery.findIndex((item) => item === this.dataset);
    this.dataset = this.gallery[index - 1];
    this.updateDOM(this.dataset);
  }

  updateDOM(data) {
    this.element.querySelector(".modal-title").innerHTML = data["caption"];
    this.element.querySelector(".modal-body img").src = data["lightbox"];
    this.element.querySelector(".modal-body img").title = data["caption"];
    this.element.querySelector(".modal-body img").alt = data["caption"];

    if (this.gallery[0] === data) {
      this.element.querySelector(".prev-lightbox").remove();
    } else if (this.gallery[this.gallery.length - 1] === data) {
      this.element.querySelector(".next-lightbox").remove();
    } else {
      const next = this.element.querySelector(".next-lightbox");
      const prev = this.element.querySelector(".prev-lightbox");
      if (!prev || !next) {
        const button = document.createElement("button");
        button.setAttribute("aria-label", `${!prev ? "précédent" : "suivant"}`);
        button.setAttribute("tabindex", 0);
        button.classList.add(`${!prev ? "prev" : "next"}-lightbox`);
        button.innerHTML = `<span aria-hidden="true" class="fa fa-chevron-${
          !prev ? "left" : "right"
        }"></span>`;
        this.element.querySelector(".modal-body").appendChild(button);
        if (!next) {
          button.addEventListener("click", this.next.bind(this));
        }
        if (!prev) {
          button.addEventListener("click", this.prev.bind(this));
        }
      }
    }
    this.setFocusable();
  }

  loop(e) {
    //Rotate Focus
    if (e.shiftKey && document.activeElement === this.firstFocusable) {
      e.preventDefault();
      this.lastFocusable.focus();
    } else if (!e.shiftKey && document.activeElement === this.lastFocusable) {
      e.preventDefault();
      this.firstFocusable.focus();
    }
  }

  trap(bool) {
    Array.from(document.body.children).forEach((child) => {
      if (child !== this.element) {
        child.inert = bool;
      }
    });
  }
}

Lightbox.init();
