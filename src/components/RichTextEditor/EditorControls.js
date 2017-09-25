import React from 'react';
import PropTypes from 'prop-types';

const BLOCK_TYPES = [
  {label: 'Väliotsikko', style: 'header-four'},
  {label: 'Lista', style: 'unordered-list-item'},
  {label: 'Numeroitu lista', style: 'ordered-list-item'},
];

const INLINE_STYLES = [
  {label: 'Lihavointi', style: 'BOLD'},
];

class StyleButton extends React.Component {
  constructor() {
    super();
    this.onToggle = (event) => {
      event.preventDefault();
      this.props.onToggle(this.props.style);
    };
  }

  render() {
    let className = 'RichEditor-styleButton';
    if (this.props.active) {
      className += ' RichEditor-activeButton';
    }
    return (
      <span className={className} onMouseDown={this.onToggle}>
        {this.props.label}
      </span>
    );
  }
}

StyleButton.propTypes = {
  active: PropTypes.bool,
  label: PropTypes.string,
  onToggle: PropTypes.func,
  style: PropTypes.string
};

const BlockStyleControls = (props) => {
  const { editorState } = props;
  const selection = editorState.getSelection();
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType();
  return (
    <div className="RichEditor-controls">
      {BLOCK_TYPES.map((type) =>
        <StyleButton
          key={type.label}
          active={type.style === blockType}
          label={type.label}
          onToggle={props.onToggle}
          style={type.style}
        />
      )}
    </div>
  );
};

BlockStyleControls.propTypes = {
  editorState: PropTypes.object,
  onToggle: PropTypes.func
};

const InlineStyleControls = (props) => {
  const currentStyle = props.editorState.getCurrentInlineStyle();
  return (
    <div className="RichEditor-controls" style={{ display: 'inline-block' }}>
      {INLINE_STYLES.map(type =>
        <StyleButton
          key={type.label}
          active={currentStyle.has(type.style)}
          label={type.label}
          onToggle={props.onToggle}
          style={type.style}
        />
      )}
    </div>
  );
};

InlineStyleControls.propTypes = {
  editorState: PropTypes.object,
  onToggle: PropTypes.func
};

export default { BlockStyleControls, InlineStyleControls };