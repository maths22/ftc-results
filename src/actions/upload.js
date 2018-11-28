import {DirectUpload} from 'activestorage/src';
import {API_BASE, TOKEN_UPDATE} from './api';

export const UPLOAD_STARTED = 'UPLOAD_STARTED';
export const UPLOAD_SUCCESS = 'UPLOAD_SUCCESS';
export const UPLOAD_FAILED = 'UPLOAD_FAILED';

function createUpload(upload) {
  return new Promise((resolve, reject) => {
    upload.create((err, blob) => {
      if (err) reject(err);
      else resolve(blob);
    });
  });
}

function activeStorageUpload(file) {
  return async (dispatch, getState) => {
    dispatch({
      type: UPLOAD_STARTED,
      payload: file
    });
    let imageBlob;
    const headers = getState().token;
    const upload = new DirectUpload(file, `${API_BASE}/active_storage/direct_uploads`, {
      directUploadWillCreateBlobWithXHR: xhr => {
        Object.keys(headers).forEach((key)=> {
          xhr.setRequestHeader(key, headers[key]);
          xhr.addEventListener('load', () => {
            const headers = xhr.getAllResponseHeaders();

            // Convert the header string into an array
            // of individual headers
            const arr = headers.trim().split(/[\r\n]+/);

            // Create a map of header names to values
            const headerMap = {};
            arr.forEach(function (line) {
              const parts = line.split(': ');
              const header = parts.shift().toLowerCase();
              if(header.startsWith('x-')) {
                const value = parts.join(': ');
                headerMap[header] = value;
              }
            });
            if(headerMap['x-access-token'] && getState().token['x-access-token'] !== headerMap['x-access-token']) {
              dispatch({
                type: TOKEN_UPDATE,
                payload: headerMap
              });
            }
          });
        });
      }
    });

    try {
      imageBlob = await createUpload(upload);
      dispatch({
        type: UPLOAD_SUCCESS,
        payload: imageBlob
      });
    } catch (err) {
      dispatch({
        type: UPLOAD_FAILED,
        error: err
      });
      throw err;
    }
    return imageBlob;
  };
}

export default activeStorageUpload;