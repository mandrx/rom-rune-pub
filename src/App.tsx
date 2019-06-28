import React from "react";
import {
  Button,
  Layout,
  Menu,
  Icon,
  Row,
  Col,
  message,
  Tabs,
  Modal,
  Input,
  Tooltip
} from "antd";
import "antd/dist/antd.less";
import "./App.scss";
import $ from "jquery";
import domtoimage from "dom-to-image";
import "dragscroll";
//import html2canvas from "html2canvas";
import { RuneSimulator } from "./components/RuneSimulator";
import {
  RuneCostType,
  JobID,
  Tier,
  RODataLang,
  GameClasses
} from "./AppInterfaces";
import Text from "antd/lib/typography/Text";
import CostSummary from "./components/CostSummary";
import "react-device-detect";
import { isMobile } from "react-device-detect";
import ButtonGroup from "antd/lib/button/button-group";
import RuneSearch from "./components/RuneSearch";
import JobSelection from "./components/JobSelection";
import JobTier from "./components/JobTier";
import PathTypeSelection from "./components/PathTypeSelection";
import RuneSummary from "./components/RuneSummary";
import { getDecodeUrlData } from "./UrlManager";

const { Header, Content, Sider } = Layout;
const { TabPane } = Tabs;

class App extends React.PureComponent {
  private defaultTier = Tier.t3;
  private defaultJob = JobID.Wizard;
  private defaultCost = RuneCostType.Medal;
  private baseHeight = 3000; //2970;
  private baseWidth = 3800;
  private shareKey = "";

  state = {
    zoomScale: 1,
    jobId: this.defaultJob,
    tier: this.defaultTier,
    costType: this.defaultCost,
    lang: RODataLang.english,
    runeNameList: {},
    collapseSideMenu: isMobile,
    showTopControl: !isMobile,
    showShareModal: false,
    cost: {
      cont: 0,
      medal: 0
    },
    summary: []
  };

  constructor(props: any) {
    super(props);
    document.title = "Ragnarok M: Eternal Love - Rune Simulator BETA";
    let jobId: number = 0;
    let tier: number = 0;
    let costType: number = Number(
      localStorage.getItem("costType")
        ? localStorage.getItem("costType")
        : this.defaultCost
    );
    const urlData = getDecodeUrlData();
    console.log("urlData", urlData);

    this.shareKey = urlData.shareKey;

    jobId = urlData.jobId
      ? urlData.jobId
      : Number(localStorage.getItem("jobId")!);
    tier = urlData.tier ? urlData.tier : Number(localStorage.getItem("tier")!);

    // Check stored value validity.
    jobId = GameClasses.getById(jobId) ? jobId : this.defaultJob;
    tier =
      tier === 20000 || tier === 30000 || tier === 40000
        ? tier
        : this.defaultTier;
    costType = costType >= 0 && costType < 3 ? costType : this.defaultCost;

    this.state.jobId = jobId;
    this.state.tier = tier;
    this.state.costType = costType;
  }

  componentDidMount() {
    const runeSimulator = this.refs.runeSimulator as RuneSimulator;
    runeSimulator.loadJobRuneData(this.state.jobId);
    runeSimulator.changeCostType(this.state.costType);
    runeSimulator.activateRuneFromShareKey(this.shareKey);
  }

  handleJobChange = (value: any) => {
    localStorage.setItem("jobId", value);
    this.setState({
      jobId: value
    });
    (this.refs.runeSimulator as RuneSimulator).loadJobRuneData(value);
  };

  handleJobTierChange = (e: any) => {
    let value = e.target.value;
    localStorage.setItem("tier", value);
    this.setState({
      tier: value
    });
    (this.refs.runeSimulator as RuneSimulator).changeTier(value);
  };

  handleCostTypeChange = (e: any) => {
    let value = e.target.value;
    localStorage.setItem("costType", value);
    this.setState({ costType: value });
    (this.refs.runeSimulator as RuneSimulator).changeCostType(value);
  };

  setCost = (cost: any) => {
    this.setState({ cost: cost });
  };

  setSummary = (summary: any) => {
    this.setState({ summary: summary });
  };

  setZoom = (zoomValue: number) => {
    if (this.state.zoomScale === zoomValue) return;
    $(".rune-simulator").css({
      transform: `scale(${zoomValue})`
    });
    this.setState({ zoomScale: zoomValue });
  };

  get boardWidth() {
    return this.baseWidth * this.state.zoomScale;
  }
  get boardHeight() {
    return this.baseHeight * this.state.zoomScale;
  }

  getRuneNameList = (nameList: any) => {
    this.setState({
      runeNameList: nameList
    });
  };

  handleSelectAll = (e: any) => {
    (this.refs.runeSimulator as RuneSimulator).selectAllRune();
  };

  handleResetRune = (e: any) => {
    (this.refs.runeSimulator as RuneSimulator).resetRune();
  };

  handleZoomInClick = (e: any) =>
    (this.refs.runeSimulator as RuneSimulator).zoomIn();

  handleZoomOutClick = (e: any) =>
    (this.refs.runeSimulator as RuneSimulator).zoomOut();

  handleResetViewClick = (e: any) => {
    (this.refs.runeSimulator as RuneSimulator).zoomReset();
    setTimeout(() => {
      this.viewportTo();
    }, 500);
  };

  isTopControlOpen = () => (this.state.showTopControl ? " is-open " : "");

  handleToggleTopControl = (e: any) =>
    this.setState({
      showTopControl: !this.state.showTopControl
    });

  handleSideTabChange = (e: any) => {
    // console.log("handleSideTabChange", e);
  };

  handleToggleSideMenu = (e: any) => {
    let el: any = $(".rune-simulator-container");
    el.css("opacity", 0);

    setTimeout(() => {
      el.css("display", "none");
      this.setState({
        collapseSideMenu: !this.state.collapseSideMenu
      });
      setTimeout(() => {
        el.css("display", "block");
        setTimeout(() => {
          el.css("opacity", 1);
        }, 50);
      }, 300);
    }, 300);
  };

  handleRuneSearchChange = (id: any) =>
    (this.refs.runeSimulator as RuneSimulator).highlightRune(id);

  blurInput = (e: any) => (document.activeElement as any).blur();

  handleTest2 = (e: any) => {
    const waitMsg = message.loading("Rendering Rune Image, Please wait...", 60);
    const prevScale = this.state.zoomScale;
    $(".App").addClass("muted");
    $(".rune-simulator").css("transform", "scale(0.5)");

    const renderImage = () => {
      domtoimage
        .toPng($(".rune-simulator-container")[0], {
          bgcolor: "#f1f3f5"
        })
        .then(function(dataUrl) {
          const time = Date.now();
          const link = document.createElement("a");
          link.download = `rune-rocodex.com-${time}.png`;
          link.href = dataUrl;
          link.click();
          waitMsg();
          $(".App").removeClass("muted");
          $(".rune-simulator").css("transform", `scale(${prevScale})`);
        });
    };

    setTimeout(renderImage, 500);
  };

  handleShareURL = (e: any) => {
    const shareUrl = (this.refs
      .runeSimulator as RuneSimulator).generateShareKey();
    this.setState({
      showShareModal: true
    });
    setTimeout(() => {
      (this.refs.shareLinkInput as any).input.value = shareUrl;
    }, 1);
  };

  copyShareLink = () => {
    (this.refs.shareLinkInput as any).input.select();
    setTimeout(() => {
      document.execCommand("copy");
    }, 10);
    message.info("Link copied!", 2);
  };

  handleCloseShareModal = (e: any) =>
    this.setState({
      showShareModal: false
    });

  viewportTo = (x: number = 0, y: number = 0) => {
    const runeViewport = $(".rune-viewport");
    const runeContent = $(".rune-simulator-wrapper");

    let heightOverflow =
      runeContent.innerHeight()! - runeViewport.innerHeight()!;
    let widthOverflow = runeContent.innerWidth()! - runeViewport.innerWidth()!;

    let centerY = heightOverflow / 2;
    let centerX = widthOverflow / 2;

    // 220 nge 160 ni dari mano pon aku xtau.... huhuhu
    let translateY = (y + 220) * this.state.zoomScale; // height
    let translateX = (x - 160) * this.state.zoomScale; // width

    let toY = centerY + translateY;
    let toX = centerX + translateX;

    runeViewport.scrollTop(toY);
    runeViewport.scrollLeft(toX);
  };
  greyoutPanel = (): string =>
    isMobile && !this.state.collapseSideMenu ? "panel-greyout" : "";

  render() {
    return (
      <div className="App">
        <Layout
          style={{
            height: "100vh"
          }}
        >
          <Layout>
            <Layout style={{ overflow: "hidden" }}>
              <Layout>
                <Sider
                  collapsed={this.state.collapseSideMenu}
                  collapsedWidth={0}
                  width={350}
                  style={{
                    overflowX: "hidden",
                    background: "#fff",
                    textAlign: "left",
                    boxShadow: "-2px 0 10px #00152921"
                  }}
                >
                  <div className="side-close">
                    <Button onClick={this.handleToggleSideMenu}>
                      <Icon type="double-left" />
                    </Button>
                  </div>
                  <CostSummary cost={this.state.cost} width={350} />

                  <Tabs
                    defaultActiveKey="1"
                    onChange={this.handleSideTabChange}
                    className="side-tab"
                    animated={false}
                    style={{
                      overflow: "hidden"
                    }}
                  >
                    <TabPane
                      tab={
                        <span>
                          <Icon type="unordered-list" />
                          Rune Summary
                        </span>
                      }
                      key="1"
                    >
                      <div
                        className="side-tab-content"
                        style={{ padding: "0 10px" }}
                      >
                        <RuneSummary
                          jobId={this.state.jobId}
                          lang={this.state.lang}
                          summaryData={this.state.summary}
                        />
                      </div>
                    </TabPane>
                    <TabPane
                      tab={
                        <span>
                          <Icon type="setting" />
                          Option
                        </span>
                      }
                      key="2"
                    >
                      <div className="side-tab-content side-control-group">
                        <div className="side-control-item">
                          <div
                            className="select-button"
                            style={{
                              width: "100%"
                            }}
                          >
                            <Text strong={true} style={{}}>
                              All Selection
                            </Text>
                            <div>
                              <ButtonGroup>
                                <Button onClick={this.handleSelectAll}>
                                  Select All
                                </Button>
                                <Button onClick={this.handleResetRune}>
                                  Unselect All
                                </Button>
                              </ButtonGroup>
                            </div>
                          </div>
                        </div>

                        <div className="side-control-item">
                          <PathTypeSelection
                            costType={this.state.costType}
                            onChange={this.handleCostTypeChange}
                            position="vertical"
                            size="default"
                          />
                        </div>

                        <div className="side-control-item">
                          <JobSelection
                            jobId={this.state.jobId}
                            size="default"
                            runeNameList={this.state.runeNameList}
                            onChange={this.handleJobChange}
                          />
                        </div>
                        <div className="side-control-item">
                          <JobTier
                            jobId={this.state.jobId}
                            runeNameList={this.state.runeNameList}
                            tier={this.state.tier}
                            size="default"
                            onChange={this.handleJobTierChange}
                            position="vertical"
                          />
                        </div>
                      </div>
                    </TabPane>
                  </Tabs>
                </Sider>

                <Layout className={`panel-content ${this.greyoutPanel()}`}>
                  <Header className="header fluid-header">
                    <div className="logo" />
                    <Menu
                      theme="dark"
                      mode="horizontal"
                      className="top-menu"
                      defaultSelectedKeys={["2"]}
                    >
                      {
                        //<Menu.Item key="1">Database</Menu.Item>
                      }
                      <Menu.Item key="1" onClick={this.handleToggleSideMenu}>
                        Side Menu (Test)
                      </Menu.Item>
                      <Menu.Item key="1x" onClick={this.handleTest2}>
                        Render Image (Test)
                      </Menu.Item>
                      <Menu.Item key="2x" onClick={this.handleShareURL}>
                        Share Link
                      </Menu.Item>
                      {/*
                      <Menu.Item key="2">Rune Simulator</Menu.Item>
                  <Menu.Item
                    key="3"
                    onClick={e => {
                      message.info("Coming soon!");
                    }}
                  >
                    Cooking Tool
                  </Menu.Item>
                  
              <Menu.Item key="4">Eternal Tower List</Menu.Item>
              <Menu.Item key="5">Valhalla Ruins</Menu.Item>
              */}
                    </Menu>
                  </Header>
                  <Row
                    className="top-panel-bar top-cost-summary"
                    type="flex"
                    justify="center"
                  >
                    <Col span={24}>
                      <CostSummary cost={this.state.cost} width={"100%"} />
                    </Col>
                  </Row>
                  <Row
                    className={`top-panel-bar top-control-container ${this.isTopControlOpen()}`}
                    type="flex"
                    justify="center"
                    gutter={12}
                    style={{}}
                  >
                    <Col lg={8} md={24} xs={24} className="rune-search-box">
                      <div>
                        <Text strong={true} style={{}}>
                          Search
                        </Text>
                        <RuneSearch
                          lang={this.state.lang}
                          runeNameList={this.state.runeNameList}
                          onChange={this.handleRuneSearchChange}
                        />
                      </div>
                    </Col>
                    <Col
                      lg={8}
                      md={12}
                      xs={24}
                      className={isMobile ? "hide-on-close" : ""}
                    >
                      <JobSelection
                        jobId={this.state.jobId}
                        runeNameList={this.state.runeNameList}
                        onChange={this.handleJobChange}
                      />
                    </Col>
                    <Col
                      lg={8}
                      md={12}
                      xs={24}
                      className={isMobile ? "hide-on-close" : ""}
                    >
                      <JobTier
                        jobId={this.state.jobId}
                        runeNameList={this.state.runeNameList}
                        tier={this.state.tier}
                        onChange={this.handleJobTierChange}
                      />
                    </Col>
                  </Row>
                  <Row type="flex" justify="end">
                    <Col>
                      <div className="floating-zoom">
                        <ButtonGroup size="large">
                          <Tooltip title="Zoom in">
                            <Button
                              icon="zoom-in"
                              onClick={this.handleZoomInClick}
                            />
                          </Tooltip>
                          <Tooltip title="Reset view">
                            <Button
                              icon="border-outer"
                              onClick={this.handleResetViewClick}
                            />
                          </Tooltip>
                          <Tooltip title="Zoom out">
                            <Button
                              icon="zoom-out"
                              onClick={this.handleZoomOutClick}
                            />
                          </Tooltip>
                        </ButtonGroup>
                      </div>
                    </Col>
                  </Row>
                  <Row type="flex" justify="center">
                    <Col>
                      <div
                        onClick={this.handleToggleTopControl}
                        className={`wobble-hor-top-slow top-control-toggle ${this.isTopControlOpen()}`}
                        style={{}}
                      >
                        <Icon type="caret-up" className="openCloseIcon" />
                      </div>
                    </Col>
                  </Row>
                  <Content
                    style={{
                      margin: 0,
                      overflow: "auto",
                      minHeight: 280
                    }}
                    ref="rune-viewport"
                    className="rune-viewport draggable dragscroll"
                    onClick={this.blurInput}
                  >
                    <div
                      className="rune-simulator-wrapper"
                      ref="rune-simulator-wrapper"
                      style={{
                        display: "block",
                        height: this.boardHeight + "px",
                        width: this.boardWidth + "px"
                      }}
                    >
                      <RuneSimulator
                        viewportTo={this.viewportTo}
                        ref="runeSimulator"
                        lang={this.state.lang}
                        setZoom={this.setZoom}
                        setCost={this.setCost}
                        setSummary={this.setSummary}
                        getRuneNameList={this.getRuneNameList}
                        tier={this.defaultTier}
                      />
                    </div>
                  </Content>
                </Layout>
              </Layout>
            </Layout>
          </Layout>
        </Layout>
        <Modal
          className="share-link-modal"
          width={850}
          title="Share Rune"
          visible={this.state.showShareModal}
          onOk={this.handleCloseShareModal}
          onCancel={this.handleCloseShareModal}
          footer={<></>}
        >
          <Input
            addonBefore="Url Link"
            addonAfter={
              <Button onClick={this.copyShareLink} type="primary" size="large">
                <Icon type="copy" /> Copy Link
              </Button>
            }
            value={window.location.href}
            ref="shareLinkInput"
            size="large"
            readOnly={true}
            onClick={this.copyShareLink}
          />
        </Modal>
      </div>
    );
  }
}

export default App;
