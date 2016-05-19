
import React from "react";
import { Link } from "react-router";
import twixty from "twixtykit";

import BroadcastGraph from "./BroadcastGraph";
import SceneEditor from "../scenes/SceneEditor";
import VertexCreate from "../vertices/VertexCreate";
import VertexDetail from "../vertices/VertexDetail";
import ArcEdit from "../arcs/ArcEdit";
import Loading from "../Loading";
import style from "./BroadcastDetail.scss";
import SK from "../../SK";

export default class BroadcastDetail extends React.Component {
  constructor(params) {
    super(params);
    this.state = {
      broadcast: {},
      showNewVertex: false,
      selected: null,
      tab: "vertexGraph",
    };
  }

  componentDidMount() {
    const broadcastId = this.props.params.broadcastId;
    this.broadcastHandle = SK.broadcasts.watch({id: broadcastId})
    .on("data", (broadcasts) => {
      this.setState({broadcast: broadcasts[0]});
    })
    .catch((...args) => {
      twixty.error(...args);
    });
  }

  componentWillUnmount() {
    this.broadcastHandle.stop();
  }

  handleNewMoteClick() {
    this.setState({showNewVertex: true});
  }

  handleCloseBottomPanelClick() {

  }

  handlePick(type, id) {
    this.setState({
      showNewVertex: false,
      selected: {type, id},
    });
  }

  clearSelection() {
    this.setState({
      selected: null,
    });
  }

  toggleEnabled() {
    const enabled = !this.state.broadcast.enabled;
    SK.broadcasts.update(this.state.broadcast.id, {enabled})
    .catch((err) => {
      twixty.error(err);
    });
  }

  switchTab(tab) {
    this.setState({tab});
  }

  getSelected(tab) {
    if (this.state.tab === tab) {
      return style.TabContainerSelected;
    }
    return "";
  }

  render() {
    if (!this.state.broadcast.id) {
      return <Loading />;
    }

    let bottomPanel = null;
    if (this.state.tab !== "vertexGraph") {
      bottomPanel = null;
    }
    else if (this.state.showNewVertex) {
      bottomPanel = <VertexCreate broadcastId={this.props.params.broadcastId} />;
    }
    else if (this.state.selected && this.state.selected.type === "vertex") {
      bottomPanel = <VertexDetail vertexId={this.state.selected.id} />;
    }
    else if (this.state.selected && this.state.selected.type === "arc") {
      bottomPanel = <ArcEdit onDelete={this.clearSelection.bind(this)} broadcastId={this.props.params.broadcastId} arcId={this.state.selected.id} />;
    }

    // If we are to be rendering a bottom panel, add its wrapper to it.
    if (bottomPanel !== null) {
      bottomPanel = (
        <section className={style.BottomPanel}>
          {bottomPanel}
        </section>
      );
    }
    let toggleEnabledButton;
    const toggle = this.toggleEnabled.bind(this);
    if (this.state.broadcast.enabled === true) {
      toggleEnabledButton = (
        <button onClick={toggle} className={style.ToggleEnabledButton}>
          Stop Broadcast
        </button>
      );
    }
    else {
      toggleEnabledButton = (
        <button onClick={toggle} className={style.ToggleEnabledButton}>
          Start Broadcast
        </button>
      );
    }

    let mainContent;
    if (this.state.tab === "vertexGraph") {
      mainContent = <BroadcastGraph onPick={this.handlePick.bind(this)} broadcastId={this.props.params.broadcastId} />;
    }
    else {
      mainContent = <SceneEditor broadcastId={this.state.broadcast.id} />;
    }
    return (
      <section className={style.verticalPanels}>
        <section className={style.header}>
          <Link to="/" className={style.backButton}>
            <i className="fa fa-chevron-left" />
          </Link>
          <h1>Broadcast <em>{this.state.broadcast.title}</em></h1>
          <nav className={style.TabContainer}>
            <a className={this.getSelected("vertexGraph")} onClick={this.switchTab.bind(this, "vertexGraph")}>
              <span>Vertex Graph</span>
            </a>
            <a className={this.getSelected("sceneEditor")} onClick={this.switchTab.bind(this, "sceneEditor")}>
              <span>Scene Editor</span>
            </a>
          </nav>
          <button className={style.newMoteButton} onClick={this.handleNewMoteClick.bind(this)}>
            <i className="fa fa-plus-square" />
          </button>
        </section>

        <section className={style.GraphPanel}>
          {toggleEnabledButton}
          {mainContent}
        </section>

        {bottomPanel}

      </section>
    );
  }
}

BroadcastDetail.propTypes = {
  "params": React.PropTypes.object.isRequired
};
