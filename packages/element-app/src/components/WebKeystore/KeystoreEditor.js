import React from 'react';
import PropTypes from 'prop-types';

import AceEditor from 'react-ace';

import 'ace-builds/webpack-resolver';
import 'ace-builds/src-min-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/ace';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-github';

class KeystoreEditor extends React.Component {
  render() {
    const { value, onChange } = this.props;

    return (
      <AceEditor
        mode="json"
        theme="github"
        style={{ width: '100%' }}
        onChange={onChange}
        name="Keystore Editor"
        value={value}
        editorProps={{ $blockScrolling: true }}
      />
    );
  }
}

KeystoreEditor.propTypes = {
  value: PropTypes.any,
  onChange: PropTypes.func,
};

export default KeystoreEditor;
