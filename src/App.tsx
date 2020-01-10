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
const { confirm } = Modal;

class App extends React.PureComponent {
  private defaultTier = Tier.t3;
  private defaultJob = JobID.Wizard;
  private defaultCost = RuneCostType.Balanced;
  private baseHeight = 3000; //2970;
  private baseWidth = 3800;
  private shareKey = "";
  private runeSimulator?: RuneSimulator;

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

    this.shareKey = urlData.shareKey;

    jobId = urlData.jobId
      ? urlData.jobId
      : Number(localStorage.getItem("jobId")!);
    tier = urlData.tier ? urlData.tier : Number(localStorage.getItem("tier")!);

    // Check stored value validity.
    jobId = GameClasses.getById(jobId) ? jobId : this.defaultJob;
    this.defaultTier = tier =
      tier === 20000 || tier === 30000 || tier === 40000 || tier === 45003
        ? tier
        : this.defaultTier;

    costType = costType >= 0 && costType < 4 ? costType : this.defaultCost;

    this.state.jobId = jobId;
    this.state.tier = tier;
    this.state.costType = costType;
  }

  private firstInit = false;

  componentDidMount() {
    const runeSimulator = this.refs.runeSimulator as RuneSimulator;
    runeSimulator.changeJob(this.state.jobId);
    runeSimulator.changeCostType(this.state.costType);
    runeSimulator.activateRuneFromShareKey(this.shareKey);
    this.runeSimulator = runeSimulator;

    if (!this.firstInit) {
      document.addEventListener("keydown", this.handleKeyDown);
      this.firstInit = true;
    }
  }

  handleJobChange = (value: any) => {
    localStorage.setItem("jobId", value);
    this.setState({
      jobId: value
    });
    this.runeSimulator!.changeJob(value);
    (this.refs.runeSearch as RuneSearch).clearSelection();
  };

  handleJobTierChange = (e: any) => {
    let value = e.target.value;
    localStorage.setItem("tier", value);
    this.setState({
      tier: value
    });
    this.runeSimulator!.changeTier(value);
  };

  handleCostTypeChange = (e: any) => {
    let value = e.target.value;
    localStorage.setItem("costType", value);
    this.setState({ costType: value });
    this.runeSimulator!.changeCostType(value);
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

  setRuneNameList = (nameList: any) => {
    this.setState({
      runeNameList: nameList
    });
  };

  handleKeyDown = (e: any) => {
    if (e.ctrlKey) {
      switch (e.key) {
        case "z":
          this.runeSimulator!.undo();
          break;
        case "y":
          this.runeSimulator!.redo();
          break;
        default:
      }
    }
  };

  handleSelectAll = (e: any) => {
    this.runeSimulator!.selectAllRune();
  };

  handleResetRune = (e: any) => {
    this.runeSimulator!.resetRune();
  };

  handleZoomInClick = (e: any) => this.runeSimulator!.zoomIn();

  handleZoomOutClick = (e: any) => this.runeSimulator!.zoomOut();

  handleResetViewClick = (e: any) => {
    //this.runeSimulator!.zoomReset();
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

  handleRuneSearchChange = (id: any) => {
    /*
    const setHeight = () => {
      const runeBoxHeight = $(".rune-search-box .ant-select").height();
      $(".top-control-container").css("minHeight","max-content");
      $(".top-control-container.is-open").css(
        "minHeight",
        Math.ceil(runeBoxHeight! + 49)
      );
    };
    
    // There is slight animation delay. Wait till animation ends.
    setTimeout(() => {
      setHeight();
    }, 600);

    // Set instantly for smoother adding transition
    setHeight();
    */

    // scroll to bottom
    setTimeout(() => {
      $(".rune-search-box .ant-select-selection--multiple")!.scrollTop(
        $(".rune-search-box .ant-select-selection--multiple").prop(
          "scrollHeight"
        ) + 50
      );
    }, 10);

    this.runeSimulator!.highlightRune(id);
  };

  blurInput = (e: any) => (document.activeElement as any).blur();

  handleSaveImage = (e: any) => {
    const __saveImage = this.__saveImage;
    confirm({
      title: 'Save as Image',
      content: 'Save rune image now? This process may take a while.',
      okText: 'Yes',
      cancelText: 'No',
      onOk() {
        __saveImage();
      },
      onCancel() {
        
      },
    });
  }

  __saveImage = () => {
    const waitMsg = message.loading("Rendering Rune Image, Please wait...", 60);
    const prevScale = this.state.zoomScale;
    let currentJobName = GameClasses.getByIdAndTier(
      this.state.jobId,
      this.state.tier
    );

    currentJobName = currentJobName
      .replace(' RK', ' Rune Knight')
      .replace(' RG', ' Royal Guard')
      .replace(' GX', ' Guilt. Cross')
      .replace(' SC', ' Shadow Chaser')
      .replace(' AB', ' Archbishop')
      .replace(' Mecha', ' Mechanic')
      .replace(' SN', ' Super Novice')
      .replace('_', ' ');

    $(".rune-simulator").css("transform", "scale(0.5)");
    $(".App").addClass("muted");
    $(".rune-simulator-container").addClass("on-screenshot");
    $(".screenshot-cost .job .value")[0].innerText = currentJobName;
    $(
      ".screenshot-cost .cont .value"
    )[0].innerText = this.state.cost.cont.toLocaleString();
    $(
      ".screenshot-cost .medal .value"
    )[0].innerText = this.state.cost.medal.toLocaleString();

    const renderImage = () => {
      domtoimage
        .toPng($(".rune-simulator-container")[0], {
          bgcolor: "#f1f3f5",
          height: 1500,
          width: 1800
        })
        .then(function (dataUrl) {
          const time = Date.now();
          const link = document.createElement("a");
          link.download = `romcodex.com-${currentJobName
            .toLowerCase()
            .replace(" ", "-")}-rune-${time}.png`;
          link.href = dataUrl;
          link.click();
          waitMsg();
          $(".App").removeClass("muted");
          $(".rune-simulator").css("transform", `scale(${prevScale})`);
          $(".rune-simulator-container").removeClass("on-screenshot");
        });
    };

    setTimeout(renderImage, 800);
  };

  handleShareURL = (e: any) => {
    const shareUrl = this.runeSimulator!.generateShareKey();
    this.setState({
      showShareModal: true
    });
    setTimeout(() => {
      (this.refs.shareLinkInput as any).input.value = shareUrl;
    }, 1);
  };

  handleBackToDatabase = (e: any) => {
    const okFunction:Function = () => {
      window.location.href = "/"
    }
    this.confirmLeave(okFunction);
  };

  handleGoToDonate = (e: any) => {
    const okFunction:Function = () => {
      window.location.href = "/donate"
    }
    this.confirmLeave(okFunction);
  };

  confirmLeave = (okFunction: Function, cancelFunction?: Function) => {
    confirm({
      title: 'Leave Rune Simulator?',
      content: 'You\'re about to leave this simulator. Are you sure?',
      okText: 'Yes, leave simulator.',
      okType: 'danger',
      cancelText: 'No, stay here',
      iconType:'exclamation-circle',
      onOk() {
        okFunction();
      },
      onCancel() {
        (!!cancelFunction) && cancelFunction();
      },
    });
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
                  <Header
                    className="header fluid-header"
                    style={{
                      paddingLeft: this.state.collapseSideMenu ? "0" : "20px"
                    }}
                  >
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
                      <Menu.Item
                        key="1"
                        className="toggle-menu-button"
                        onClick={this.handleToggleSideMenu}
                        style={{
                          display: this.state.collapseSideMenu
                            ? "inline-block"
                            : "none"
                        }}
                      >
                        <Icon type="menu" />
                        Menu
                      </Menu.Item>
                      <Menu.Item key="0x" onClick={this.handleBackToDatabase}>
                      <Icon type="appstore" />
                        Database
                      </Menu.Item>
                      <Menu.Item key="1x" onClick={this.handleSaveImage}>
                        <Icon type="file-image" />
                        Save as Image
                      </Menu.Item>
                      <Menu.Item key="2x" onClick={this.handleShareURL}>
                        <Icon type="share-alt" />
                        Share Link
                      </Menu.Item>
                      <Menu.Item key="3x" onClick={this.handleGoToDonate}>
                        <Icon type="heart" theme="filled" />
                        Donate
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
                          ref="runeSearch"
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
                  <Row type="flex" justify="space-between">
                    <Col>
                      <div className="floating-history">
                        <ButtonGroup size={isMobile ? "default" : "large"}>
                          <Tooltip
                            title={`Undo ${!isMobile ? "(Ctrl + Z)" : ""}`}
                          >
                            <Button
                              icon="undo"
                              onClick={e => {
                                this.runeSimulator!.undo();
                              }}
                            />
                          </Tooltip>

                          <Tooltip
                            title={`Redo ${!isMobile ? "(Ctrl + Y)" : ""}`}
                          >
                            <Button
                              icon="redo"
                              onClick={e => {
                                this.runeSimulator!.redo();
                              }}
                            />
                          </Tooltip>
                        </ButtonGroup>
                      </div>
                    </Col>
                    <Col>
                      <div className="floating-zoom">
                        <ButtonGroup size={isMobile ? "default" : "large"}>
                          <Tooltip title="Zoom in">
                            <Button
                              icon="zoom-in"
                              onClick={this.handleZoomInClick}
                            />
                          </Tooltip>
                          <Tooltip title="Move to center">
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
                        setRuneNameList={this.setRuneNameList}
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
