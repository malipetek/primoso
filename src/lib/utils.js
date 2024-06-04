import _ from 'lodash-es';
import { customAlphabet } from 'nanoid/non-secure';

export function clickOutside(node) {

  const handleClick = event => {
    if (node && !node.contains(event.target) && !event.defaultPrevented) {
      node.dispatchEvent(
        new CustomEvent('click_outside', node)
      );
    }
  };

  document.addEventListener('click', handleClick, true);

  return {
    destroy() {
      document.removeEventListener('click', handleClick, true);
    }
  };
}

export function swap_array_item_index(arr, from, to) {
  let new_array = _.cloneDeep(arr);
  new_array[from] = arr[to];
  new_array[to] = arr[from];
  return new_array;
}

export function validate_url(url) {
  return url
    .replace(/\s+/g, '-')
    .replace(/[^0-9a-z\-._]/gi, '')
    .toLowerCase();
}

export function createUniqueID(length = 5) {
  const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz', length);
  return nanoid();
}

export function parseJwt(token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload);
}
