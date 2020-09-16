const getBoolean = (key, defaultValue) => {
  const value = localStorage.getItem(key);
  if (typeof value !== 'string') {
    return defaultValue;
  }
  return JSON.parse(value);
};

const jsEnabled = getBoolean('jsEnabled', true);
const toggleAtStartup = getBoolean('toggleAtStartup', true);

const statusClass = (baseClass, status) => baseClass + (/--/.test(baseClass) ? '-' : '--') + status;

const activateJs = (baseClasses, enforce) => {
  if (jsEnabled || enforce) {
    baseClasses.forEach((baseClass) => {
      const nojsClass = statusClass(baseClass, 'nojs');
      document.querySelectorAll('.' + nojsClass).forEach((el) => {
        el.classList.remove(nojsClass);
      });
    });
  }
};

const queryElements = (classList) => {
  const elements = [];
  classList.forEach((klass) => {
    if (typeof (klass) === 'string') {
      document.querySelectorAll('.' + klass).forEach(node => {
        elements.push({klass, node});
      });
    }
    else {
      elements.push(klass);
    }
  });
  return elements;
};

const activateSticky = (minScrollY, classList, status = 'sticky') => {
  if (!jsEnabled) {
    return;
  }
  const elements = queryElements(classList);

  window.addEventListener('scroll', (evt) => {
    if (window.scrollY >= minScrollY) {
      elements.forEach(({node, klass}) => {
        node.classList.add(statusClass(klass, status));
      });
    }
    else {
      elements.forEach(({node, klass}) => {
        node.classList.remove(statusClass(klass, status));
      });
    }
  });
};

function activateToggle(toggleClass, activeClassList, inactiveClassList = [], toggle = false, status = `active`) {
  const toggleList = [];
  (Array.isArray(toggleClass) ? toggleClass : [toggleClass]).forEach((toggleClass) => {
    if (typeof (toggleClass) === 'string') {
      toggleList.push(...document.querySelectorAll('.' + toggleClass));
    }
    else {
      toggleList.push(toggleClass);
    }
  });

  const activeList = queryElements(activeClassList);
  const inactiveList = queryElements(inactiveClassList);

  const click = () => {
    inactiveList.forEach(({node, klass}) => {
      if (activeList.indexOf(node) === -1) {
        node.classList.remove(statusClass(klass, status));
      }
    });
    activeList.forEach(({node, klass}) => {
      node.classList.toggle(statusClass(klass, status));
    });
  };

  toggleList.forEach(toggle => toggle.addEventListener('click', (evt) => {
    evt.preventDefault();
    click(toggle);
  }));

  if (toggle) {
    click();
  }
}

activateJs(['add-plan__menu']);

function activateAddPlanMenu() {
  const activeClass = 'add-plan__menu-item--active';
  const items = document.querySelectorAll('.add-plan__menu-item[data-hash]');

  let changed = false;
  items.forEach((item) => {
    if (window.location.hash === item.getAttribute('data-hash')) {
      changed = true;
      item.classList.add(activeClass);
    }
    else {
      item.classList.remove(activeClass);
    }
  });
  if (!changed && items.length) {
    items[0].classList.add(activeClass);
  }
}

activateAddPlanMenu();
window.addEventListener('hashchange', activateAddPlanMenu);

document.querySelectorAll('.add-plan__form').forEach((form) => {
  const comments = form.querySelectorAll('.add-plan__comment-text');
  comments.forEach((comment) => comment.required = false);

  form.addEventListener('submit', (evt) => {
    let ok = true;

    comments.forEach((comment) => {
      comment.classList.remove('add-plan__comment-text--error');

      if (!comment.value) {
        comment.classList.add('add-plan__comment-text--error');
        comment.focus();
        ok = false;
      }
    });

    if (!ok) {
      evt.preventDefault();
    }
  });
});

jsEnabled && activateToggle(['rates__business', 'business__close'], ['business'], [], false);


activateJs(['country-filter__popup', 'country-filter__toggle']);

activateToggle('country-filter__toggle', [
  'country-filter__toggle--permanent',
  'country-filter__toggle-text',
  'country-filter__inner',
  'country-filter__continents',
  'country-filter__letters',
  'country-filter__countries',
  'country-filter__toggle--temporary',
], [], toggleAtStartup);

activateJs(['country-select__select-item']);

jsEnabled && document.querySelectorAll('.country-select').forEach((block) => {
  const inner = block.querySelector('.country-select__inner');
  const select = block.querySelector('.country-select__select');
  const popup = block.querySelector('.country-select__popup');
  const del = block.querySelector('.country-select__delete');

  if (!select) {
    return;
  }

  select.addEventListener('mousedown', (evt) => evt.preventDefault());

  activateToggle([select], [
    {node: block, klass: 'country-select'},
    {node: inner, klass: 'country-select__inner'},
    {node: select, klass: 'country-select__select'},
    {node: popup, klass: 'country-select__popup'},
    {node: del, klass: 'country-select__delete'},
  ], []);
});

document.querySelectorAll('.feedback__signup-form').forEach((form) => {
  const input = form.querySelector('.feedback__signup-input');
  input.required = false;

  form.addEventListener('submit', (evt) => {
    let ok = true;
    input.classList.remove('feedback__signup-input--error');
    input.placeholder = input.getAttribute(`placeholder`);

    if (!input.value) {
      input.classList.add('feedback__signup-input--error');
      input.placeholder = `Введите e-mail`;
      input.focus();
      ok = false;
    }

    if (!ok) {
      evt.preventDefault();
    }
  });
});

activateJs(['filter__fieldset-toggle']);

document.querySelectorAll('.filter__fieldset').forEach((fieldset) => {
  const toggle = fieldset.querySelector('.filter__fieldset-toggle');
  const inner = fieldset.querySelector('.filter__fieldset-inner');

  activateToggle([toggle], [
    {node: toggle, klass: 'filter__fieldset-toggle'},
    {node: inner, klass: 'filter__fieldset-inner'},
  ], [], toggleAtStartup);
});

activateJs([
  'page-header__nav',
  'page-header__inner',
  'page-header__toggle-button',
]);

activateToggle('page-header__toggle', [
  'page-header__nav',
  'page-header__inner',
  'page-header__logo-image',
  'page-header__toggle-button',
  'page-header__toggle-inner',
  'page-header__site-nav',
  'page-header__user-nav',
  'page-header__contacts',
  'page-header__socials',
], [], toggleAtStartup);

activateSticky(1, [
  'page-header__nav',
  'page-header__inner',
  'page-header__toggle',
  'page-header__toggle-inner--open',
  'page-header__toggle-button',
  'page-header__logo-image--dark',
  'page-header__logo-image--light',
]);

activateJs(['user__save-button']);

activateJs(['user-profile__save-button']);
