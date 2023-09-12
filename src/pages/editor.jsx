import { useState } from "react";
import PropTypes from 'prop-types';
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./styles.css";

export const Editor = (props) => {

  //https://scriptverse.academy/tutorials/reactjs-rich-text-editor.html

  const [ rt, setRt ] = useState(props.initText)

  const handleRtChange = (value, delta, source, editor) => { 
    setRt(value)
    props.setRt(value)
    props.setBody(editor.getText())
  }

  const modules = {
      toolbar: {
          container: [
            [{header: [1,2,3,false]}],
            ['bold', 'italic'],
            ['link'],
            [{ list: 'ordered' }, { list: 'bullet' }]
          ]
      }
  }

  const formats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "list",
    "bullet",
    "link",
  ];

  return (
    <div className="text-editor">
      <ReactQuill
        theme="snow"
        value={rt}
        onChange={handleRtChange}
        placeholder={"Add your comments, notes, and links here..."}
        modules={modules}
        formats={formats}
      />
    </div>
  );
};

Editor.propTypes = {
    initText: PropTypes.string,
    setRt: PropTypes.func,
    setBody: PropTypes.func
}

export default Editor;
