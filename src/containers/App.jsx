import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ReactGA from 'react-ga';

import AppLayout from '../components/AppLayout/AppLayout';

import { AugmentAsync, AugmentSettings } from '../store/actions/Augment';
import { HackAsync } from '../store/actions/Hack';
import { WishAsync } from '../store/actions/Wish';
import { Go2Titan, Settings } from '../store/actions/Settings';
import { Crement } from '../store/actions/Crement';
import { DisableItem } from '../store/actions/DisableItem';
import { ToggleEdit } from '../store/actions/ToggleEdit';
import { EditItem } from '../store/actions/EditItem';
import { EditFactor } from '../store/actions/EditFactor';
import { EquipItem } from '../store/actions/EquipItem';
import { HideZone } from '../store/actions/HideZone';
import { LockItem } from '../store/actions/LockItem';
import { OptimizeGearAsync } from '../store/actions/OptimizeGear';
import { OptimizeSavesAsync } from '../store/actions/OptimizeSaves';
import { Terminate } from '../store/actions/Terminate';
import { Undo } from '../store/actions/Undo';
import { UnequipItem } from '../store/actions/UnequipItem';
import { DeleteSlot } from '../store/actions/DeleteSlot';
import { LoadFactors, LoadSlot } from '../store/actions/LoadSlot';
import { SaveName, SaveSlot } from '../store/actions/SaveSlot';
import { ToggleSaved, ToggleUnused } from '../store/actions/ToggleSaved';
import { LoadStateLocalStorage } from '../store/actions/LoadStateLocalStorage';
import { SaveStateLocalStorage } from '../store/actions/SaveStateLocalStorage';

import '../stylesheets/App.css';


ReactGA.initialize('UA-141463995-1');


class App extends Component {
  componentDidMount = () => {
    const { handleLoadStateLocalStorage } = this.props;
    handleLoadStateLocalStorage();
  };

  componentDidUpdate = () => {
    const { handleSaveStateLocalStorage } = this.props;
    handleSaveStateLocalStorage(this.props);
  };

  render() {
    return <AppLayout {...this.props} />;
  }
}

App.propTypes = {
  handleLoadStateLocalStorage: PropTypes.func.isRequired,
  handleSaveStateLocalStorage: PropTypes.func.isRequired,
};


const mapStateToProps = (state) => ({
  itemdata: state.optimizer.itemdata,
  items: state.optimizer.items,
  offhand: state.optimizer.offhand,
  equip: state.optimizer.equip,
  locked: state.optimizer.locked,
  lastequip: state.optimizer.lastequip,
  savedequip: state.optimizer.savedequip,
  savedidx: state.optimizer.savedidx,
  maxsavedidx: state.optimizer.maxsavedidx,
  showsaved: state.optimizer.showsaved,
  showunused: state.optimizer.showunused,
  editItem: state.optimizer.editItem,
  factors: state.optimizer.factors,
  maxslots: state.optimizer.maxslots,
  running: state.optimizer.running,
  zone: state.optimizer.zone,
  titanversion: state.optimizer.titanversion,
  looty: state.optimizer.looty,
  pendant: state.optimizer.pendant,
  hidden: state.optimizer.hidden,
  augstats: state.optimizer.augstats,
  basestats: state.optimizer.basestats,
  capstats: state.optimizer.capstats,
  cubestats: state.optimizer.cubestats,
  ngustats: state.optimizer.ngustats,
  hackstats: state.optimizer.hackstats,
  wishstats: state.optimizer.wishstats,
  version: state.optimizer.version,
});

const mapDispatchToProps = {
  handleCrement: Crement,
  handleDisableItem: DisableItem,
  handleToggleEdit: ToggleEdit,
  handleEditItem: EditItem,
  handleLockItem: LockItem,
  handleEditFactor: EditFactor,
  handleEquipItem: EquipItem,
  handleHideZone: HideZone,
  handleOptimizeGear: OptimizeGearAsync,
  handleOptimizeSaves: OptimizeSavesAsync,
  handleTerminate: Terminate,
  handleUndo: Undo,
  handleUnequipItem: UnequipItem,
  handleDeleteSlot: DeleteSlot,
  handleLoadFactors: LoadFactors,
  handleLoadSlot: LoadSlot,
  handleSaveName: SaveName,
  handleSaveSlot: SaveSlot,
  handleToggleSaved: ToggleSaved,
  handleToggleUnused: ToggleUnused,
  handleAugmentSettings: AugmentSettings,
  handleAugmentAsync: AugmentAsync,
  handleHackAsync: HackAsync,
  handleWishAsync: WishAsync,
  handleSettings: Settings,
  handleGo2Titan: Go2Titan,
  handleSaveStateLocalStorage: SaveStateLocalStorage,
  handleLoadStateLocalStorage: LoadStateLocalStorage,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
