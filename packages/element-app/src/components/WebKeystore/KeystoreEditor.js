import React from 'react';
import PropTypes from 'prop-types';

// eslint-disable-next-line
import brace from 'brace';
import AceEditor from 'react-ace';

// eslint-disable-next-line
import 'brace/mode/json';
// eslint-disable-next-line
import 'brace/theme/github';

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
  value: PropTypes.string,
  onChange: PropTypes.func,
};

export default KeystoreEditor;
