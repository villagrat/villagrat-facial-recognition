import React, { useState } from 'react';
import ImageLinkFormCSS from './ImageLinkForm.css';

const ImageLinkForm = () => {
  const [input, setInput] = useState('');

  const onSubmit = async (event) => {
    event.preventDefault();

    // doRequest();
  };

  return (
    <div>
      <p className="f3 center">Facial Recognition App</p>
      <div className="form center pa4 br3 shadow-5">
        <form onSubmit={onSubmit} className="f4 pa2 fill">
          <div className="form-group center">
            <input
              className="f4 pa2 w-70 form-control"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            ></input>
            <button className="w-30 grow f4 link ph3 pv2 dib white bg-purple">
              Detect
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ImageLinkForm;
