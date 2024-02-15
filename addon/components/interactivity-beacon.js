import Component from '@ember/component';
import { scheduleOnce } from '@ember/runloop';
import { computed } from '@ember/object';
import ComponentInteractivity from 'ember-interactivity/mixins/component-interactivity';
import layout from '../templates/components/interactivity-beacon';

export default Component.extend(ComponentInteractivity, {
  layout,
  beaconId: '',
  _latencyReportingName: computed('beaconId', function () {
    return `beacon:${this.get('beaconId')}`;
  }),
  didInsertElement() {
    this._super(...arguments);
    scheduleOnce('afterRender', this, this.reportInteractive);
  }
});
