import React, { useEffect, useState } from "react";
import {
  Editor,
  EditorState,
  Modifier,
  RichUtils,
  getDefaultKeyBinding,
  convertToRaw,
  convertFromRaw,
} from "draft-js";
import "draft-js/dist/Draft.css";
import "./App.css";

const App = () => {
  const [editorState, setEditorState] = useState(() => {
    // Load content from local storage
    const savedContent = localStorage.getItem("draftEditorContent");
    if (savedContent) {
      const rawContentState = JSON.parse(savedContent);
      return EditorState.createWithContent(convertFromRaw(rawContentState));
    }
    return EditorState.createEmpty();
  });
  const saveToLocalStorage = () => {
    const contentState = editorState.getCurrentContent();
    const contentAsText = JSON.stringify(convertToRaw(contentState));
    localStorage.setItem("draftEditorContent", contentAsText);
  };
  console.log(editorState)
  useEffect(() => {
    // Add an event listener to save content when the component unmounts
    return () => {
      saveToLocalStorage();
    };
    // eslint-disable-next-line 
  }, []);

  const handleBeforeInput = (char, editorState) => {
    const contentState = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const currentBlock = contentState.getBlockForKey(selection.getStartKey());
    const currentText = currentBlock.getText();
    const blockText = currentBlock.getText();
    console.log(char, currentText);
    // Check for heading format
    const startOffset = selection.getStartOffset();
    const textBefore = currentBlock.getText().slice(0, startOffset);
    if (textBefore.endsWith("\n")) {
      // Reset styles for the new line
      const newContentState = Modifier.removeInlineStyle(
        contentState,
        selection.merge({ anchorOffset: 0, focusOffset: startOffset }),
        "black",
      );
      const newEditorState = EditorState.push(
        editorState,
        newContentState,
        "black",
      );
      setEditorState(newEditorState);
    }

    if (
      char === " " &&
      currentText.startsWith("#") &&
      selection.getStartOffset() === 1
    ) {
      // Apply 'header-one' inline style to the entire block
      const newContent = Modifier.setBlockType(
        contentState,
        selection.merge({
          anchorOffset: 0,
          focusOffset: blockText.length,
        }),
        "header-one",
      );

      const updatedContent = Modifier.replaceText(
        newContent,
        selection.merge({
          anchorOffset: 0,
          focusOffset: 1,
        }),
        "",
        editorState.getCurrentInlineStyle(),
        null,
      );

      const newEditorState = EditorState.push(
        editorState,
        updatedContent,
        "insert-characters",
      );
      setEditorState(RichUtils.toggleInlineStyle(newEditorState, "header-one"));

      return "handled";
    }

    // Check for bold format
    if (
      char === " " &&
      currentText.startsWith("*") &&
      selection.getStartOffset() === 1
    ) {
      // Apply 'header-one' inline style to the entire block
      const newContent = Modifier.applyInlineStyle(
        contentState,
        selection.merge({
          anchorOffset: 0,
          focusOffset: blockText.length,
        }),
        "BOLD",
      );

      const updatedContent = Modifier.replaceText(
        newContent,
        selection.merge({
          anchorOffset: 0,
          focusOffset: 1,
        }),
        "",
        editorState.getCurrentInlineStyle(),
        null,
      );

      const newEditorState = EditorState.push(
        editorState,
        updatedContent,
        "insert-characters",
      );
      setEditorState(RichUtils.toggleInlineStyle(newEditorState, "BOLD"));

      return "handled";
    }

    // Check for red line format
    if (
      char === " " &&
      currentText.startsWith("**") &&
      selection.getStartOffset() === 2
    ) {
      // Apply 'header-one' inline style to the entire block
      const newContent = Modifier.applyInlineStyle(
        contentState,
        selection.merge({
          anchorOffset: 0,
          focusOffset: blockText.length,
        }),
        "red",
      );

      const updatedContent = Modifier.replaceText(
        newContent,
        selection.merge({
          anchorOffset: 0,
          focusOffset: 2,
        }),
        "",
        editorState.getCurrentInlineStyle(),
        null,
      );

      const newEditorState = EditorState.push(
        editorState,
        updatedContent,
        "insert-characters",
      );
      setEditorState(RichUtils.toggleInlineStyle(newEditorState, "red"));

      return "handled";
    }

    // Check for underline format
    if (
      char === " " &&
      currentText.startsWith("***") &&
      selection.getStartOffset() === 3
    ) {
      // Apply 'header-one' inline style to the entire block
      const newContent = Modifier.applyInlineStyle(
        contentState,
        selection.merge({
          anchorOffset: 0,
          focusOffset: blockText.length,
        }),
        "UNDERLINE",
      );

      const updatedContent = Modifier.replaceText(
        newContent,
        selection.merge({
          anchorOffset: 0,
          focusOffset: 3,
        }),
        "",
        editorState.getCurrentInlineStyle(),
        null,
      );

      const newEditorState = EditorState.push(
        editorState,
        updatedContent,
        "insert-characters",
      );
      setEditorState(RichUtils.toggleInlineStyle(newEditorState, "UNDERLINE"));

      return "handled";
    }

    return "not-handled";
  };
  function handleKeyCommand(command, editorState) {
    if (command === 'handle-newline') {
      const selection = editorState.getSelection();
      const contentState = editorState.getCurrentContent();

      // Create a new block of type 'unstyled'
      const newContentState = Modifier.splitBlock(contentState, selection);
      const newEditorState = EditorState.push(editorState, newContentState, 'split-block');
      const newEditorStateWithStyles = RichUtils.toggleInlineStyle(
        newEditorState,
        'black' // Add your default styles here
      );

      // Set the new editor state
      setEditorState(newEditorStateWithStyles);
  
      return 'handled';
    }
    return 'not-handled';
  }

  const mapKeyToEditorCommand = (e) => {
    if (e.key === "Enter") {
      return "handle-newline";
    }
    return getDefaultKeyBinding(e);
  };

  const onChange = (newEditorState) => {
    setEditorState(newEditorState);
  };
  
  return (
    <div>
    <h2 id="header">Demo Editor by Manas </h2>
    <div className="button">
    <button id="button_class"  onClick={saveToLocalStorage}>
      Save
    </button>
    </div>
    <Editor
      editorState={editorState}
      onChange={onChange}
      handleBeforeInput={handleBeforeInput}
      handleKeyCommand={handleKeyCommand}
      keyBindingFn={mapKeyToEditorCommand}
      customStyleMap={{
        red: {
          color: "red",
          fontWeight:"normal"
        },
        UNDERLINE: {
          textDecoration: "UNDERLINE",
          color:"black",
          fontWeight:"normal"
        },
        "header-one": {
           fontSize: "2em",
          fontWeight: "bolder",
          color:"black"
        },
        black:{
          fontSize:"20px",
          fontWeight:"normal",
          textDecoration: "none",
          color:"none"
        },
        BOLD:{
          fontSize:"40px",
          fontWeight:"bold"
        }
      }}
    />
  </div>
  );
};

export default App;
