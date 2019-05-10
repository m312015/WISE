'use strict';

var _angular = require('angular');

var _angular2 = _interopRequireDefault(_angular);

var _main = require('vle/main');

var _main2 = _interopRequireDefault(_main);

require('angular-mocks');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('ProjectService Unit Test', function () {

  beforeEach(_angular2.default.mock.module(_main2.default.name));

  var demoProjectJSONOriginal = window.mocks['test-unit/sampleData/curriculum/DemoProject/project'];
  var scootersProjectJSONOriginal = window.mocks['test-unit/sampleData/curriculum/SelfPropelledVehiclesChallenge/project'];

  var ConfigService = void 0,
      ProjectService = void 0,
      $rootScope = void 0,
      $httpBackend = void 0,
      demoProjectJSON = void 0,
      scootersProjectJSON = void 0;
  beforeEach(inject(function (_ConfigService_, _ProjectService_, _$rootScope_, _$httpBackend_) {
    ConfigService = _ConfigService_;
    ProjectService = _ProjectService_;
    $rootScope = _$rootScope_;
    $httpBackend = _$httpBackend_;
    demoProjectJSON = JSON.parse(JSON.stringify(demoProjectJSONOriginal));
    scootersProjectJSON = JSON.parse(JSON.stringify(scootersProjectJSONOriginal));
  }));

  describe('ProjectService', function () {
    var projectIdDefault = 1;
    var projectBaseURL = "http://localhost:8080/curriculum/12345/";
    var projectURL = projectBaseURL + "project.json";
    var saveProjectURL = "http://localhost:8080/wise/project/save/" + projectIdDefault;
    var commitMessageDefault = "Made simple changes";
    var defaultCommitHistory = [{ "id": "abc", "message": "first commit" }, { "id": "def", "message": "second commit" }];
    var wiseBaseURL = "/wise";
    var i18nURL_common_en = "wise5/i18n/i18n_en.json";
    var i18nURL_vle_en = "wise5/vle/i18n/i18n_en.json";
    var sampleI18N_common_en = window.mocks['test-unit/sampleData/i18n/common/i18n_en'];
    var sampleI18N_vle_en = window.mocks['test-unit/sampleData/i18n/vle/i18n_en'];

    function createNormalSpy() {
      spyOn(ConfigService, "getConfigParam").and.callFake(function (param) {
        if (param === "projectBaseURL") {
          return projectBaseURL;
        } else if (param === "projectURL") {
          return projectURL;
        } else if (param === "saveProjectURL") {
          return saveProjectURL;
        } else if (param === "wiseBaseURL") {
          return wiseBaseURL;
        }
      });
    }

    it('should replace asset paths in non-html component content', function () {
      createNormalSpy();
      var contentString = "<img src=\'hello.png\' /><style>{background-url:\'background.jpg\'}</style>";
      var contentStringReplacedAssetPathExpected = "<img src=\'" + projectBaseURL + "assets/hello.png\' /><style>{background-url:\'" + projectBaseURL + "assets/background.jpg\'}</style>";
      var contentStringReplacedAssetPathActual = ProjectService.replaceAssetPaths(contentString);
      expect(ConfigService.getConfigParam).toHaveBeenCalledWith("projectBaseURL");
      expect(contentStringReplacedAssetPathActual).toEqual(contentStringReplacedAssetPathExpected);
    });

    it('should replace asset paths in html component content', function () {
      createNormalSpy();
      var contentString = "style=\\\"background-image: url(\\\"background.jpg\\\")\\\"";
      var contentStringReplacedAssetPathExpected = "style=\\\"background-image: url(\\\"" + projectBaseURL + "assets/background.jpg\\\")\\\"";
      var contentStringReplacedAssetPathActual = ProjectService.replaceAssetPaths(contentString);
      expect(ConfigService.getConfigParam).toHaveBeenCalledWith("projectBaseURL");
      expect(contentStringReplacedAssetPathActual).toEqual(contentStringReplacedAssetPathExpected);
    });

    it('should not replace asset paths in html component content', function () {
      createNormalSpy();
      var contentString = "<source type=\"video/mp4\">";
      var contentStringReplacedAssetPathExpected = "<source type=\"video/mp4\">";
      var contentStringReplacedAssetPathActual = ProjectService.replaceAssetPaths(contentString);
      expect(ConfigService.getConfigParam).toHaveBeenCalledWith("projectBaseURL");
      expect(contentStringReplacedAssetPathActual).toEqual(contentStringReplacedAssetPathExpected);
    });

    xit('should retrieve project when Config.projectURL is valid', function () {
      createNormalSpy();
      spyOn(ProjectService, "setProject").and.callThrough(); // actually call through the function
      spyOn(ProjectService, "parseProject");
      $httpBackend.when('GET', new RegExp(projectURL)).respond(scootersProjectJSON);
      $httpBackend.expectGET(new RegExp(projectURL));
      $httpBackend.when('GET', i18nURL_common_en).respond(sampleI18N_common_en);
      $httpBackend.when('GET', i18nURL_vle_en).respond(sampleI18N_vle_en);
      var projectPromise = ProjectService.retrieveProject();
      $httpBackend.flush();
      expect(ConfigService.getConfigParam).toHaveBeenCalledWith("projectURL");
      expect(ProjectService.setProject).toHaveBeenCalledWith(scootersProjectJSON);
      expect(ProjectService.parseProject).toHaveBeenCalled();
      expect(ProjectService.project).toEqual(scootersProjectJSON);
    });

    it('should not retrieve project when Config.projectURL is undefined', function () {
      spyOn(ConfigService, "getConfigParam").and.returnValue(null);
      var project = ProjectService.retrieveProject();
      expect(ConfigService.getConfigParam).toHaveBeenCalledWith("projectURL");
      expect(project).toBeNull();
    });

    // MARK: Save Project
    xit('should save project', function () {
      spyOn(ConfigService, "getProjectId").and.returnValue(projectIdDefault);
      spyOn(ConfigService, "getConfigParam").and.returnValue(saveProjectURL);
      ProjectService.setProject(scootersProjectJSON);
      $httpBackend.when('GET', /^wise5\/components\/.*/).respond(200, '');
      //$httpBackend.when('GET', 'wise5/components/animation/i18n/i18n_en.json').respond(200, '');
      //$httpBackend.when('GET', 'wise5/components/audioOscillator/i18n/i18n_en.json').respond(200, '');
      $httpBackend.when('POST', saveProjectURL).respond({ data: defaultCommitHistory });
      $httpBackend.when('GET', i18nURL_common_en).respond(sampleI18N_common_en);
      $httpBackend.when('GET', i18nURL_vle_en).respond(sampleI18N_vle_en);
      var newProjectIdActualPromise = ProjectService.saveProject(commitMessageDefault);
      expect(ConfigService.getConfigParam).toHaveBeenCalledWith("saveProjectURL");
      expect(ConfigService.getProjectId).toHaveBeenCalled();
      $httpBackend.expectPOST(saveProjectURL);
      $httpBackend.flush();
      $httpBackend.verifyNoOutstandingExpectation(false); // <-- no unnecessary $digest
    });

    it('should not save project when Config.saveProjectURL is undefined', function () {
      spyOn(ConfigService, "getProjectId").and.returnValue(projectIdDefault);
      spyOn(ConfigService, "getConfigParam").and.returnValue(null);
      ProjectService.setProject(scootersProjectJSON);
      var newProjectIdActualPromise = ProjectService.saveProject(commitMessageDefault);
      expect(ConfigService.getConfigParam).toHaveBeenCalledWith("saveProjectURL");
      expect(ConfigService.getProjectId).toHaveBeenCalled();
      expect(newProjectIdActualPromise).toBeNull();
    });

    it('should not save project when Config.projectId is undefined', function () {
      spyOn(ConfigService, "getProjectId").and.returnValue(null);
      spyOn(ConfigService, "getConfigParam").and.returnValue(saveProjectURL);
      ProjectService.setProject(scootersProjectJSON);
      var newProjectIdActualPromise = ProjectService.saveProject(commitMessageDefault);
      expect(ConfigService.getConfigParam).toHaveBeenCalledWith("saveProjectURL");
      expect(ConfigService.getProjectId).toHaveBeenCalled();
      expect(newProjectIdActualPromise).toBeNull();
    });

    // MARK: ThemePath
    it('should get default theme path when theme is not defined in the project', function () {
      spyOn(ConfigService, "getConfigParam").and.returnValue(wiseBaseURL);
      ProjectService.setProject(scootersProjectJSON);
      var expectedThemePath = wiseBaseURL + "/wise5/themes/default";
      var actualThemePath = ProjectService.getThemePath();
      expect(ConfigService.getConfigParam).toHaveBeenCalledWith("wiseBaseURL");
      expect(actualThemePath).toEqual(expectedThemePath);
    });

    it('should get project theme path when theme is defined in the project', function () {
      spyOn(ConfigService, "getConfigParam").and.returnValue(wiseBaseURL);
      ProjectService.setProject(demoProjectJSON);
      var demoProjectTheme = demoProjectJSON.theme; // Demo Project has a theme defined
      var expectedThemePath = wiseBaseURL + "/wise5/themes/" + demoProjectTheme;
      var actualThemePath = ProjectService.getThemePath();
      expect(ConfigService.getConfigParam).toHaveBeenCalledWith("wiseBaseURL");
      expect(actualThemePath).toEqual(expectedThemePath);
    });
    // TODO: add test for ProjectService.getFlattenedProjectAsNodeIds()
    // TODO: add test for ProjectService.getAllPaths()
    // TODO: add test for ProjectService.consolidatePaths()
    // TODO: add test for ProjectService.consumePathsUntilNodeId()
    // TODO: add test for ProjectService.getFirstNodeIdInPathAtIndex()
    // TODO: add test for ProjectService.removeNodeIdFromPaths()
    // TODO: add test for ProjectService.removeNodeIdFromPath()

    // TODO: add test for ProjectService.areFirstNodeIdsInPathsTheSame()
    // TODO: add test for ProjectService.arePathsEmpty()
    // TODO: add test for ProjectService.getPathsThatContainNodeId()
    // TODO: add test for ProjectService.getNonEmptyPathIndex()
    // TODO: add test for ProjectService.getBranches()
    // TODO: add test for ProjectService.findBranches()

    // TODO: add test for ProjectService.createBranchMetaObject()
    // TODO: add test for ProjectService.findNextCommonNodeId()
    // TODO: add test for ProjectService.allPathsContainNodeId()
    // TODO: add test for ProjectService.trimPathsUpToNodeId()
    // TODO: add test for ProjectService.extractPathsUpToNodeId()
    // TODO: add test for ProjectService.removeDuplicatePaths()
    // TODO: add test for ProjectService.pathsEqual()

    // TODO: add test for ProjectService.isNodeIdInABranch()
    // TODO: add test for ProjectService.getBranchPathsByNodeId()


    // TODO: add test for ProjectService.getNodeContentByNodeId()

    // TODO: add test for ProjectService.replaceComponent()
    // TODO: add test for ProjectService.createGroup()
    // TODO: add test for ProjectService.createNode()
    // TODO: add test for ProjectService.createNodeInside()
    // TODO: add test for ProjectService.createNodeAfter()
    // TODO: add test for ProjectService.insertNodeAfterInGroups()
    // TODO: add test for ProjectService.insertNodeAfterInTransitions()

    // TODO: add test for ProjectService.insertNodeInsideInGroups()
    // TODO: add test for ProjectService.insertNodeInsideOnlyUpdateTransitions()

    // MARK: Tests for Node and Group Id functions
    it('should return the start node of the project', function () {
      ProjectService.setProject(demoProjectJSON);
      var expectedStartNodeId = "node1"; // Demo project's start node id
      var actualStartNodeId = ProjectService.getStartNodeId();
      expect(actualStartNodeId).toEqual(expectedStartNodeId);
    });

    it('should return the node by nodeId', function () {
      ProjectService.setProject(scootersProjectJSON);
      var node1 = ProjectService.getNodeById("node1");
      expect(node1.type).toEqual("node");
      expect(node1.title).toEqual("Introduction to Newton Scooters");
      expect(node1.components.length).toEqual(1);

      // Call getNodeId with null and expect a null return value
      var nodeBadArgs = ProjectService.getNodeById();
      expect(nodeBadArgs).toBeNull();

      // Test node that doesn't exist in project and make sure the function returns null
      var nodeNE = ProjectService.getNodeById("node999");
      expect(nodeNE).toBeNull();
    });

    it('should return the node title by nodeId', function () {
      ProjectService.setProject(scootersProjectJSON);
      var node1Title = ProjectService.getNodeTitleByNodeId("node1");
      expect(node1Title).toEqual("Introduction to Newton Scooters");

      // Call getNodeTitleByNodeId with null and expect a null return value
      var nodeTitleBadArgs = ProjectService.getNodeTitleByNodeId();
      expect(nodeTitleBadArgs).toBeNull();

      // Test node that doesn't exist in project and make sure the function returns null
      var nodeTitleNE = ProjectService.getNodeTitleByNodeId("node999");
      expect(nodeTitleNE).toBeNull();
    });

    // TODO: add test for ProjectService.getNodePositionAndTitleByNodeId()
    // TODO: add test for ProjectService.getNodeIconByNodeId()

    it('should return the next available node id', function () {
      createNormalSpy();
      ProjectService.setProject(scootersProjectJSON);
      var nextNodeIdExpected = "node41"; // This should be the next available node id.
      var nextNodeIdActual = ProjectService.getNextAvailableNodeId();
      expect(nextNodeIdActual).toEqual(nextNodeIdExpected);
    });

    it('should return the next available group id', function () {
      createNormalSpy();
      ProjectService.setProject(scootersProjectJSON);
      var nextGroupIdExpected = "group7"; // This should be the next available group id.
      var nextGroupIdActual = ProjectService.getNextAvailableGroupId();
      expect(nextGroupIdActual).toEqual(nextGroupIdExpected);
    });

    it('should return the group ids in the project', function () {
      createNormalSpy();
      ProjectService.setProject(scootersProjectJSON);
      var groupIdsExpected = ["group0", "group1", "group2", "group3", "group4", "group5", "group6"]; // This should be the group ids in the project
      var groupIdsActual = ProjectService.getGroupIds();
      expect(groupIdsActual).toEqual(groupIdsExpected);
    });

    it('should return the node ids in the project', function () {
      createNormalSpy();
      ProjectService.setProject(scootersProjectJSON);
      var nodeIdsExpected = ['node1', 'node2', 'node3', 'node4', 'node5', 'node6', 'node7', 'node9', 'node12', 'node13', 'node14', 'node18', 'node19', 'node21', 'node22', 'node23', 'node24', 'node25', 'node26', 'node27', 'node28', 'node29', 'node30', 'node31', 'node40', 'node32', 'node33', 'node34', 'node35', 'node36', 'node37', 'node38', 'node39', 'nodeWithNoComponents']; // This should be the node ids in the project
      var nodeIdsActual = ProjectService.getNodeIds();
      expect(nodeIdsActual).toEqual(nodeIdsExpected);
    });

    it('should get the component by node id and component id', function () {
      ProjectService.setProject(scootersProjectJSON);
      // nodeId is null
      var nullNodeIdResult = ProjectService.getComponentByNodeIdAndComponentId(null, "57lxhwfp5r");
      expect(nullNodeIdResult).toBeNull();

      // componentId is null
      var nullComponentIdResult = ProjectService.getComponentByNodeIdAndComponentId("node13", null);
      expect(nullComponentIdResult).toBeNull();

      // nodeId doesn't exist
      var nodeIdDNEResult = ProjectService.getComponentByNodeIdAndComponentId("badNodeId", "57lxhwfp5r");
      expect(nodeIdDNEResult).toBeNull();

      // componentId doesn't exist
      var componentIdDNEResult = ProjectService.getComponentByNodeIdAndComponentId("node13", "badComponentId");
      expect(componentIdDNEResult).toBeNull();

      // nodeId and componentId are valid and the component exists in the project
      var componentExists = ProjectService.getComponentByNodeIdAndComponentId("node13", "57lxhwfp5r");
      expect(componentExists).not.toBe(null);
      expect(componentExists.type).toEqual("HTML");

      var componentExists2 = ProjectService.getComponentByNodeIdAndComponentId("node9", "mnzx68ix8h");
      expect(componentExists2).not.toBe(null);
      expect(componentExists2.type).toEqual("embedded");
      expect(componentExists2.url).toEqual("NewtonScooters-potential-kinetic.html");
    });

    it('should get the component position by node id and comonent id', function () {
      ProjectService.setProject(scootersProjectJSON);
      // nodeId is null
      var nullNodeIdResult = ProjectService.getComponentPositionByNodeIdAndComponentId(null, "57lxhwfp5r");
      expect(nullNodeIdResult).toEqual(-1);

      // componentId is null
      var nullComponentIdResult = ProjectService.getComponentPositionByNodeIdAndComponentId("node13", null);
      expect(nullComponentIdResult).toEqual(-1);

      // nodeId doesn't exist
      var nodeIdDNEResult = ProjectService.getComponentPositionByNodeIdAndComponentId("badNodeId", "57lxhwfp5r");
      expect(nodeIdDNEResult).toEqual(-1);

      // componentId doesn't exist
      var componentIdDNEResult = ProjectService.getComponentPositionByNodeIdAndComponentId("node13", "badComponentId");
      expect(componentIdDNEResult).toEqual(-1);

      // nodeId and componentId are valid and the component exists in the project
      var componentExists = ProjectService.getComponentPositionByNodeIdAndComponentId("node13", "57lxhwfp5r");
      expect(componentExists).toEqual(0);

      var componentExists2 = ProjectService.getComponentPositionByNodeIdAndComponentId("node9", "mnzx68ix8h");
      expect(componentExists2).toEqual(1);
    });

    it('should get the components by node id', function () {
      ProjectService.setProject(scootersProjectJSON);
      // nodeId is null
      var nullNodeIdResult = ProjectService.getComponentsByNodeId(null);
      expect(nullNodeIdResult).toEqual([]);

      // nodeId doesn't exist
      var nodeIdDNEResult = ProjectService.getComponentsByNodeId("badNodeId");
      expect(nodeIdDNEResult).toEqual([]);

      // nodeId exists but the node.components is null
      var nodeWithNullComponentResult = ProjectService.getComponentsByNodeId("nodeWithNoComponents");
      expect(nodeWithNullComponentResult).toEqual([]);

      // nodeId is are valid and the node exists in the project
      var nodeExistsResult = ProjectService.getComponentsByNodeId("node13");
      expect(nodeExistsResult).not.toBe(null);
      expect(nodeExistsResult.length).toEqual(1);
      expect(nodeExistsResult[0].id).toEqual("57lxhwfp5r");

      var nodeExistsResult2 = ProjectService.getComponentsByNodeId("node9");
      expect(nodeExistsResult2).not.toBe(null);
      expect(nodeExistsResult2.length).toEqual(7);
      expect(nodeExistsResult2[2].id).toEqual("nm080ntk8e");
      expect(nodeExistsResult2[2].type).toEqual("Table");
    });

    // TODO: add test for ProjectService.moveNodesInside()
    // TODO: add test for ProjectService.moveNodesAfter()
    // TODO: add test for ProjectService.deconsteNode()
    // TODO: add test for ProjectService.removeNodeIdFromTransitions()
    // TODO: add test for ProjectService.removeNodeIdFromGroups()
    // TODO: add test for ProjectService.removeNodeIdFromNodes()
    // TODO: add test for ProjectService.createComponent()
    // TODO: add test for ProjectService.addComponentToNode()
    // TODO: add test for ProjectService.moveComponentUp()
    // TODO: add test for ProjectService.moveComponentDown()
    // TODO: add test for ProjectService.deconsteComponent()

    it('should return the max score of the project', function () {
      // Demo Project doesn't have any max scores, so we expect getMaxScore to return null
      ProjectService.setProject(demoProjectJSON);
      var demoProjectMaxScoreActual = ProjectService.getMaxScore();
      expect(demoProjectMaxScoreActual).toBeNull(); // When the project doesn't have any max scores defined, max score should be null

      // Sample Scooter Project's max score is 18.
      ProjectService.setProject(scootersProjectJSON);
      var scootersProjectMaxScoreExpected = 18;
      var scootersProjectMaxScoreActual = ProjectService.getMaxScore();
      expect(scootersProjectMaxScoreActual).toEqual(scootersProjectMaxScoreExpected);
    });

    it('should not add space if it does exist', function () {
      ProjectService.setProject(scootersProjectJSON);
      var spaces = ProjectService.getSpaces();
      expect(spaces.length).toEqual(2);
      var space = {
        "id": "public",
        "name": "Public",
        "isPublic": true,
        "isShareWithNotebook": true
      };
      ProjectService.addSpace(space);
      expect(spaces.length).toEqual(2);
      expect(spaces[0].id).toEqual("public");
      expect(spaces[1].id).toEqual("ideasAboutGlobalClimateChange");
    });

    it('should add space if it doesn\'t exist', function () {
      ProjectService.setProject(scootersProjectJSON);
      var spaces = ProjectService.getSpaces();
      expect(spaces.length).toEqual(2);
      var space = {
        "id": "newSpace",
        "name": "New Space to share your thoughts",
        "isPublic": true,
        "isShareWithNotebook": false
      };
      ProjectService.addSpace(space);
      expect(spaces.length).toEqual(3);
      expect(spaces[0].id).toEqual("public");
      expect(spaces[1].id).toEqual("ideasAboutGlobalClimateChange");
      expect(spaces[2].id).toEqual("newSpace");
    });

    it('should not remove a space that does not exist', function () {
      ProjectService.setProject(demoProjectJSON);
      var spaces = ProjectService.getSpaces();
      expect(spaces.length).toEqual(1);
      ProjectService.removeSpace("public");
      expect(spaces.length).toEqual(1);
    });

    it('should remove a space that does exist', function () {
      ProjectService.setProject(demoProjectJSON);
      var spaces = ProjectService.getSpaces();
      expect(spaces.length).toEqual(1);
      ProjectService.removeSpace("sharePictures");
      expect(spaces.length).toEqual(0);
    });

    it('should check order between step and step/group', function () {
      ProjectService.setProject(demoProjectJSON);
      expect(ProjectService.isNodeIdAfter('node1', 'node2')).toBeTruthy();
      expect(ProjectService.isNodeIdAfter('node2', 'node1')).toBeFalsy();
      expect(ProjectService.isNodeIdAfter('node1', 'group2')).toBeTruthy();
      expect(ProjectService.isNodeIdAfter('node20', 'group1')).toBeFalsy();
    });

    it('should check order between group and step/group', function () {
      ProjectService.setProject(demoProjectJSON);
      expect(ProjectService.isNodeIdAfter('group1', 'group2')).toBeTruthy();
      expect(ProjectService.isNodeIdAfter('group2', 'group1')).toBeFalsy();
      expect(ProjectService.isNodeIdAfter('group1', 'node20')).toBeTruthy();
      expect(ProjectService.isNodeIdAfter('group2', 'node1')).toBeFalsy();
    });

    it('should remove transitions going out of group in child nodes of group', function () {
      ProjectService.setProject(demoProjectJSON);
      expect(ProjectService.getTransitionsByFromNodeId('node18').length).toEqual(1);
      expect(ProjectService.getTransitionsByFromNodeId('node19').length).toEqual(1);
      ProjectService.removeTransitionsOutOfGroup('group1');
      expect(ProjectService.getTransitionsByFromNodeId('node18').length).toEqual(1);
      expect(ProjectService.getTransitionsByFromNodeId('node19').length).toEqual(0);
    });

    it('should remove node from group', function () {
      ProjectService.setProject(demoProjectJSON);
      expect(ProjectService.getChildNodeIdsById('group1').length).toEqual(19);
      ProjectService.removeNodeIdFromGroup(ProjectService.getNodeById('group1'), 'node3');
      expect(ProjectService.getChildNodeIdsById('group1').length).toEqual(18);
      expect(ProjectService.getGroupStartId('group1')).toEqual('node1');
      ProjectService.removeNodeIdFromGroup(ProjectService.getNodeById('group1'), 'node4');
      expect(ProjectService.getChildNodeIdsById('group1').length).toEqual(17);
      expect(ProjectService.getGroupStartId('group1')).toEqual('node1');
    });

    it('should remove start node from group', function () {
      ProjectService.setProject(demoProjectJSON);
      expect(ProjectService.getChildNodeIdsById('group1').length).toEqual(19);
      ProjectService.removeNodeIdFromGroup(ProjectService.getNodeById('group1'), 'node1');
      expect(ProjectService.getChildNodeIdsById('group1').length).toEqual(18);
      expect(ProjectService.getGroupStartId('group1')).toEqual('node2');
      ProjectService.removeNodeIdFromGroup(ProjectService.getNodeById('group1'), 'node2');
      expect(ProjectService.getChildNodeIdsById('group1').length).toEqual(17);
      expect(ProjectService.getGroupStartId('group1')).toEqual('node3');
    });

    it('should identify branch start point', function () {
      ProjectService.setProject(demoProjectJSON);
      expect(ProjectService.isBranchStartPoint("group1")).toBeFalsy();
      expect(ProjectService.isBranchStartPoint("node29")).toBeFalsy();
      expect(ProjectService.isBranchStartPoint("node32")).toBeFalsy();
      expect(ProjectService.isBranchStartPoint("node30")).toBeTruthy();
    });

    it('should identify branch merge point', function () {
      ProjectService.setProject(demoProjectJSON);
      expect(ProjectService.isBranchMergePoint("group1")).toBeFalsy();
      expect(ProjectService.isBranchMergePoint("node30")).toBeFalsy();
      expect(ProjectService.isBranchMergePoint("node32")).toBeFalsy();
      expect(ProjectService.isBranchMergePoint("node34")).toBeTruthy();
    });

    it('should get path when nodeId is found', function () {
      var paths = [['node1', 'node2', 'node3', 'node4', 'node5']];
      var subPath = ProjectService.consumePathsUntilNodeId(paths, 'node3');
      var expectedPath = ['node1', 'node2'];
      expect(JSON.stringify(subPath)).toEqual(JSON.stringify(expectedPath));

      var paths2 = [['node1', 'node2', 'node3', 'node4', 'node5'], ['node1', 'node2', 'node4', 'node3', 'node5']];
      var subPath2 = ProjectService.consumePathsUntilNodeId(paths2, 'node3');
      var expectedPath2 = ['node1', 'node2', 'node4'];
      expect(JSON.stringify(subPath2)).toEqual(JSON.stringify(expectedPath2));
    });

    it('should get path when nodeId is found as first', function () {
      var paths = [['node1', 'node2', 'node3', 'node4', 'node5']];
      var subPath = ProjectService.consumePathsUntilNodeId(paths, 'node1');
      var expectedPath = [];
      expect(JSON.stringify(subPath)).toEqual(JSON.stringify(expectedPath));

      var paths2 = [['node1', 'node2', 'node3', 'node4', 'node5'], ['node1', 'node2', 'node4', 'node3', 'node5']];
      var subPath2 = ProjectService.consumePathsUntilNodeId(paths2, 'node1');
      var expectedPath2 = [];
      expect(JSON.stringify(subPath2)).toEqual(JSON.stringify(expectedPath2));
    });

    it('should get path when nodeId is not found', function () {
      var paths = [['node1', 'node2', 'node3', 'node4', 'node5']];
      var subPath = ProjectService.consumePathsUntilNodeId(paths, 'node6');
      var expectedPath = [];
      expect(JSON.stringify(subPath)).toEqual(JSON.stringify(expectedPath));

      var paths2 = [['node1', 'node2', 'node3', 'node4', 'node5'], ['node1', 'node2', 'node4', 'node3', 'node5']];
      var subPath2 = ProjectService.consumePathsUntilNodeId(paths2, 'node6');
      var expectedPath2 = [];
      expect(JSON.stringify(subPath2)).toEqual(JSON.stringify(expectedPath2));
    });

    it('should be able to insert a step node after another step node', function () {
      ProjectService.setProject(demoProjectJSON);
      expect(ProjectService.nodeHasTransitionToNodeId(ProjectService.getNodeById('node1'), 'node2')).toBeTruthy();
      ProjectService.insertNodeAfterInTransitions(ProjectService.getNodeById('node1'), 'node2');
      expect(ProjectService.nodeHasTransitionToNodeId(ProjectService.getNodeById('node1'), 'node2')).toBeFalsy();
      expect(ProjectService.nodeHasTransitionToNodeId(ProjectService.getNodeById('node2'), 'node1')).toBeTruthy();
    });

    it('should be able to insert an activity node after another activity node', function () {
      ProjectService.setProject(demoProjectJSON);
      expect(ProjectService.nodeHasTransitionToNodeId(ProjectService.getNodeById('group1'), 'group2')).toBeTruthy();
      ProjectService.insertNodeAfterInTransitions(ProjectService.getNodeById('group1'), 'group2');
      expect(ProjectService.nodeHasTransitionToNodeId(ProjectService.getNodeById('group1'), 'group2')).toBeFalsy();
      expect(ProjectService.nodeHasTransitionToNodeId(ProjectService.getNodeById('group2'), 'group1')).toBeTruthy();
    });

    it('should not be able to insert a node after another node when they are different types', function () {
      ProjectService.setProject(demoProjectJSON);
      expect(function () {
        ProjectService.insertNodeAfterInTransitions(ProjectService.getNodeById('node1'), 'group2');
      }).toThrow('Error: insertNodeAfterInTransitions() nodes are not the same type');
    });

    it('should be able to insert a step node inside an group node', function () {
      ProjectService.setProject(demoProjectJSON);
      var node1 = ProjectService.getNodeById('node1');
      var node19 = ProjectService.getNodeById('node19');
      expect(ProjectService.nodeHasTransitionToNodeId(node1, 'node2')).toBeTruthy();
      expect(ProjectService.nodeHasTransitionToNodeId(node1, 'node20')).toBeFalsy();
      expect(ProjectService.nodeHasTransitionToNodeId(node19, 'node20')).toBeTruthy();
      expect(ProjectService.nodeHasTransitionToNodeId(node19, 'node1')).toBeFalsy();
      ProjectService.insertNodeInsideOnlyUpdateTransitions('node1', 'group2');
      expect(ProjectService.nodeHasTransitionToNodeId(node1, 'node20')).toBeTruthy();
      expect(ProjectService.nodeHasTransitionToNodeId(node1, 'node2')).toBeFalsy();
      expect(ProjectService.nodeHasTransitionToNodeId(node19, 'node1')).toBeTruthy();
      expect(ProjectService.nodeHasTransitionToNodeId(node19, 'node20')).toBeFalsy();
    });

    it('should be able to insert a group node inside a group node', function () {
      ProjectService.setProject(demoProjectJSON);
      var group1 = ProjectService.getNodeById('group1');
      var group2 = ProjectService.getNodeById('group2');
      expect(ProjectService.nodeHasTransitionToNodeId(group1, 'group2')).toBeTruthy();
      expect(ProjectService.nodeHasTransitionToNodeId(group2, 'group1')).toBeFalsy();
      ProjectService.insertNodeInsideOnlyUpdateTransitions('group2', 'group0');
      expect(ProjectService.nodeHasTransitionToNodeId(group2, 'group1')).toBeTruthy();
      /*
       * the transition from group1 to group2 still remains because it is usually
       * removed by calling removeNodeIdFromTransitions() but we don't call it here
       */
      expect(ProjectService.nodeHasTransitionToNodeId(group1, 'group2')).toBeTruthy();
    });

    it('should not be able to insert a step node inside a step node', function () {
      ProjectService.setProject(demoProjectJSON);
      expect(function () {
        ProjectService.insertNodeInsideOnlyUpdateTransitions('node1', 'node2');
      }).toThrow('Error: insertNodeInsideOnlyUpdateTransitions() second parameter must be a group');
    });

    it('should delete a step from the project', function () {
      ProjectService.setProject(demoProjectJSON);
      expect(ProjectService.getNodes().length).toEqual(37);
      expect(ProjectService.getNodeById("node5") != null).toBeTruthy();
      expect(ProjectService.nodeHasTransitionToNodeId(ProjectService.getNodeById("node4"), 'node5')).toBeTruthy();
      expect(ProjectService.nodeHasTransitionToNodeId(ProjectService.getNodeById("node5"), 'node6')).toBeTruthy();
      expect(ProjectService.getNodesWithTransitionToNodeId('node6').length).toEqual(1);
      ProjectService.deleteNode("node5");
      expect(ProjectService.getNodes().length).toEqual(36);
      expect(ProjectService.getNodeById("node5")).toBeNull();
      expect(ProjectService.nodeHasTransitionToNodeId(ProjectService.getNodeById("node4"), 'node6')).toBeTruthy();
      expect(ProjectService.getNodesWithTransitionToNodeId('node6').length).toEqual(1);
    });

    it('should delete a step that is the start id of the project', function () {
      ProjectService.setProject(demoProjectJSON);
      expect(ProjectService.getStartNodeId()).toEqual("node1");
      expect(ProjectService.getNodesWithTransitionToNodeId('node2').length).toEqual(1);
      ProjectService.deleteNode("node1");
      expect(ProjectService.getStartNodeId()).toEqual("node2");
      expect(ProjectService.getNodesWithTransitionToNodeId('node2').length).toEqual(0);
    });

    it('should delete a step that is the start id of an activity that is not the first activity', function () {
      ProjectService.setProject(demoProjectJSON);
      expect(ProjectService.getGroupStartId("group2")).toEqual("node20");
      expect(ProjectService.nodeHasTransitionToNodeId(ProjectService.getNodeById("node19"), 'node20')).toBeTruthy();
      expect(ProjectService.nodeHasTransitionToNodeId(ProjectService.getNodeById("node20"), 'node21')).toBeTruthy();
      ProjectService.deleteNode("node20");
      expect(ProjectService.getGroupStartId("group2")).toEqual("node21");
      expect(ProjectService.nodeHasTransitionToNodeId(ProjectService.getNodeById("node19"), 'node21')).toBeTruthy();
    });

    it('should delete the first activity from the project', function () {
      ProjectService.setProject(demoProjectJSON);
      expect(ProjectService.getGroupStartId("group0")).toEqual("group1");
      expect(ProjectService.getStartNodeId()).toEqual("node1");
      expect(ProjectService.getNodes().length).toEqual(37);
      expect(ProjectService.getNodesWithTransitionToNodeId('node20').length).toEqual(1);
      ProjectService.deleteNode("group1");
      expect(ProjectService.getNodeById("group1")).toBeNull();
      expect(ProjectService.getGroupStartId("group0")).toEqual("group2");
      expect(ProjectService.getStartNodeId()).toEqual("node20");
      expect(ProjectService.getNodes().length).toEqual(17);
      expect(ProjectService.getNodesWithTransitionToNodeId('node20').length).toEqual(0);
    });

    it('should delete an activity that is not the first from the project', function () {
      ProjectService.setProject(demoProjectJSON);
      expect(ProjectService.nodeHasTransitionToNodeId(ProjectService.getNodeById("group1"), 'group2')).toBeTruthy();
      expect(ProjectService.getTransitionsByFromNodeId("group1").length).toEqual(1);
      expect(ProjectService.getNodes().length).toEqual(37);
      ProjectService.deleteNode("group2");
      expect(ProjectService.nodeHasTransitionToNodeId(ProjectService.getNodeById("group1"), 'group2')).toBeFalsy();
      expect(ProjectService.getTransitionsByFromNodeId("group1").length).toEqual(0);
      expect(ProjectService.getNodes().length).toEqual(21);
    });
  });
});
//# sourceMappingURL=projectService.spec.js.map
