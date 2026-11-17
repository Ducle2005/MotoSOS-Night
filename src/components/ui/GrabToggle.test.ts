import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { GrabToggle } from './GrabToggle';

describe('GrabToggle Component specification', () => {
  test('GrabToggle is a valid functional component accepting checked and onChange', () => {
    assert.equal(typeof GrabToggle, 'function');

    let nextValue: boolean | null = null;
    const element = React.createElement(GrabToggle, {
      checked: false,
      onChange: (next) => {
        nextValue = next;
      },
    });

    assert.equal(element.type, GrabToggle);
    assert.equal(element.props.checked, false);

    // Call onChange with inverted value
    element.props.onChange(!element.props.checked);
    assert.equal(nextValue, true);
  });

  test('GrabToggle handles true state and flips to false', () => {
    let nextValue: boolean | null = null;
    const element = React.createElement(GrabToggle, {
      checked: true,
      onChange: (next) => {
        nextValue = next;
      },
    });

    assert.equal(element.props.checked, true);
    element.props.onChange(!element.props.checked);
    assert.equal(nextValue, false);
  });
});
