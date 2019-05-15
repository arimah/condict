import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Map} from 'immutable';

import {Button} from '@condict/admin-ui';

import * as S from './styles';

export default class StemsInput extends Component {
  constructor(props) {
    super(props);

    const {initialValue} = props;
    this.state = {
      stems: initialValue.entrySeq().toJS(),
    };

    this.emitStems = this.emitStems.bind(this);
  }

  emitStems() {
    const stemsMap = Map(this.state.stems);
    this.props.onChange(stemsMap);
  }

  handleNameChange(index, newName) {
    const {stems} = this.state;
    const newStems = index === stems.length
      ? stems.concat([[newName, '']])
      : stems.map((stem, i) => i === index ? [newName, stem[1]] : stem);
    this.setState({stems: newStems}, this.emitStems);
  }

  handleValueChange(index, newValue) {
    const {stems} = this.state;
    const newStems = index === stems.length
      ? stems.concat([['', newValue]])
      : stems.map((stem, i) => i === index ? [stem[0], newValue] : stem);
    this.setState({stems: newStems}, this.emitStems);
  }

  handleDeleteStem(index) {
    const {stems} = this.state;
    const newStems = stems.filter((_, i) => i !== index);
    this.setState({stems: newStems}, this.emitStems);
  }

  render() {
    const {stems} = this.state;

    const stemInputs = stems.map(([name, value], index) =>
      <S.Item key={index}>
        <S.NameInput
          value={name}
          onChange={e => this.handleNameChange(index, e.target.value)}
        />
        {': '}
        <S.ValueInput
          value={value}
          onChange={e => this.handleValueChange(index, e.target.value)}
        />
        {' '}
        <Button
          intent='danger'
          slim
          label='Delete'
          onClick={() => this.handleDeleteStem(index)}
        >
          X
        </Button>
      </S.Item>
    );
    stemInputs.push(
      <S.Item key={stems.length}>
        <S.NameInput
          placeholder='New stem'
          onChange={e => this.handleNameChange(stems.length, e.target.value)}
        />
        {': '}
        <S.ValueInput
          onChange={e => this.handleValueChange(stems.length, e.target.value)}
        />
      </S.Item>
    );

    return (
      <S.List>
        {stemInputs}
      </S.List>
    );
  }
}

StemsInput.propTypes = {
  initialValue: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};
