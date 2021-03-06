'use strict';

class NodeGradingController {

    constructor($filter,
                $state,
                $stateParams,
                AnnotationService,
                ConfigService,
                NodeService,
                ProjectService,
                StudentStatusService,
                TeacherDataService) {

        this.$filter = $filter;
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.AnnotationService = AnnotationService;
        this.ConfigService = ConfigService;
        this.NodeService = NodeService;
        this.ProjectService = ProjectService;
        this.StudentStatusService = StudentStatusService;
        this.TeacherDataService = TeacherDataService;

        this.nodeId = this.$stateParams.nodeId;

        // the max score for the node
        this.maxScore = this.ProjectService.getMaxScoreForNode(this.nodeId);
        this.hasMaxScore = (typeof this.maxScore === 'number');

        this.hiddenComponents = [];

        // TODO: add loading indicator
        this.TeacherDataService.retrieveStudentDataByNodeId(this.nodeId).then(result => {

            // field that will hold the node content
            this.nodeContent = null;

            this.teacherWorkgroupId = this.ConfigService.getWorkgroupId();

            this.periods = [];

            var node = this.ProjectService.getNodeById(this.nodeId);

            if (node != null) {

                // field that will hold the node content
                this.nodeContent = node;
            }

            this.workgroupIds = this.ConfigService.getClassmateWorkgroupIds();

            this.canViewStudentNames = true;
            this.canGradeStudentWork = true;

            // get the role of the teacher for the run e.g. 'owner', 'write', 'read'
            var role = this.ConfigService.getTeacherRole(this.teacherWorkgroupId);

            if (role === 'owner') {
                // the teacher is the owner of the run and has full access
                this.canViewStudentNames = true;
                this.canGradeStudentWork = true;
            } else if (role === 'write') {
                // the teacher is a shared teacher that can grade the student work
                this.canViewStudentNames = true;
                this.canGradeStudentWork = true;
            } else if (role === 'read') {
                // the teacher is a shared teacher that can only view the student work
                this.canViewStudentNames = false;
                this.canGradeStudentWork = false;
            }

            this.annotationMappings = {};

            this.componentStateHistory = [];

            // scroll to the top of the page when the page loads
            document.body.scrollTop = document.documentElement.scrollTop = 0;
        });

        // save event when node grading view is displayed and save the nodeId that is displayed
        let context = "ClassroomMonitor", nodeId = this.nodeId, componentId = null, componentType = null,
            category = "Navigation", event = "studentProgressViewDisplayed", data = { nodeId: this.nodeId };
        this.TeacherDataService.saveEvent(context, nodeId, componentId, componentType, category, event, data);
    }

    /**
     * Get the html template for the component
     * @param componentType the component type
     * @return the path to the html template for the component
     */
    getComponentTemplatePath(componentType) {
        return this.NodeService.getComponentTemplatePath(componentType);
    }

    /**
     * Get the components for this node.
     * @return an array that contains the content for the components
     */
    getComponents() {
        var components = null;

        if (this.nodeContent != null) {
            components = this.nodeContent.components;
        }

        if (components != null && this.isDisabled) {
            for (var c = 0; c < components.length; c++) {
                var component = components[c];

                component.isDisabled = true;
            }
        }

        if (components != null && this.nodeContent.lockAfterSubmit) {
            for (c = 0; c < components.length; c++) {
                component = components[c];

                component.lockAfterSubmit = true;
            }
        }

        return components;
    }

    getComponentById(componentId) {
        var component = null;

        if (componentId != null) {
            var components = this.getComponents();

            if (components != null) {
                for (var c = 0; c < components.length; c++) {
                    var tempComponent = components[c];

                    if (tempComponent != null) {
                        if (componentId === tempComponent.id) {
                            component = tempComponent;
                            break;
                        }
                    }
                }
            }
        }

        return component;
    }

    /**
     * Get the student data for a specific part
     * @param the componentId
     * @param the workgroupId id of Workgroup who created the component state
     * @return the student data for the given component
     */
    getLatestComponentStateByWorkgroupIdAndComponentId(workgroupId,  componentId) {
        var componentState = null;

        if (workgroupId != null && componentId != null) {
            // get the latest component state for the component
            componentState = this.TeacherDataService.getLatestComponentStateByWorkgroupIdNodeIdAndComponentId(workgroupId, this.nodeId, componentId);
        }

        return componentState;
    }

    /**
     * Get the student data for a specific part
     * @param the componentId
     * @param the workgroupId id of Workgroup who created the component state
     * @return the student data for the given component
     */
    getLatestComponentStateByWorkgroupIdAndNodeIdAndComponentId(workgroupId, nodeId, componentId) {
        var componentState = null;

        if (workgroupId != null && nodeId != null && componentId != null) {

            // get the latest component state for the component
            componentState = this.TeacherDataService.getLatestComponentStateByWorkgroupIdNodeIdAndComponentId(workgroupId, nodeId, componentId);
        }

        return componentState;
    }

    getComponentStatesByWorkgroupIdAndNodeId(workgroupId, nodeId) {
        var componentStates = this.TeacherDataService.getComponentStatesByWorkgroupIdAndNodeId(workgroupId, nodeId);

        //AnnotationService.populateAnnotationMappings(this.annotationMappings, workgroupId, componentStates);

        return componentStates;
    }

    getUserNameByWorkgroupId(workgroupId) {
        return this.ConfigService.getUserNameByWorkgroupId(workgroupId);
    }

    getAnnotationByStepWorkIdAndType(stepWorkId, type) {
        return this.AnnotationService.getAnnotationByStepWorkIdAndType(stepWorkId, type);
    }

    getNodeScoreByWorkgroupIdAndNodeId(workgroupId, nodeId) {
        let score = this.AnnotationService.getScore(workgroupId, nodeId);
        return (typeof score === 'number' ? score : '-');
    }

    scoreChanged(stepWorkId) {
        var annotation = this.annotationMappings[stepWorkId + '-score'];
        this.AnnotationService.saveAnnotation(annotation);
    }

    commentChanged(stepWorkId) {
        var annotation = this.annotationMappings[stepWorkId + '-comment'];
        this.AnnotationService.saveAnnotation(annotation);
    }

    setupComponentStateHistory() {
        this.getComponentStatesByWorkgroupIdAndNodeId()
    }

    /**
     * Get the period id for a workgroup id
     * @param workgroupId the workgroup id
     * @returns the period id for the workgroup id
     */
    getPeriodIdByWorkgroupId(workgroupId) {
        return this.ConfigService.getPeriodIdByWorkgroupId(workgroupId);
    }

    /**
     * Get the current period
     */
    getCurrentPeriod() {
        return this.TeacherDataService.getCurrentPeriod();
    }

    /**
     * Get the percentage of the class or period that has completed the node
     * @param nodeId the node id
     * @returns the percentage of the class or period that has completed the node
     */
    getNodeCompletion(nodeId) {
        // get the currently selected period
        let currentPeriod = this.getCurrentPeriod();
        let periodId = currentPeriod.periodId;

        // get the percentage of the class or period that has completed the node
        let completionPercentage = this.StudentStatusService.getNodeCompletion(nodeId, periodId);

        return completionPercentage;
    }

    /**
     * Get the average score for the node
     * @param nodeId the node id
     * @returns the average score for the node
     */
    getNodeAverageScore() {
        // get the currently selected period
        let currentPeriod = this.TeacherDataService.getCurrentPeriod();
        let periodId = currentPeriod.periodId;

        // get the average score for the node
        let averageScore = this.StudentStatusService.getNodeAverageScore(this.nodeId, periodId);

        return (averageScore === null ? 'N/A' : this.$filter('number')(averageScore, 1));
    }

    /**
     * Checks whether a workgroup is in the current period
     * @param workgroupId the workgroupId to look for
     * @returns boolean whether the workgroup is in the current period
     */
    isWorkgroupInCurrentPeriod(workgroupId) {
        return (this.getCurrentPeriod().periodName === "All" ||
            this.getPeriodIdByWorkgroupId(workgroupId) === this.getCurrentPeriod().periodId);
    }

    onUpdateHiddenComponents(value) {
        this.hiddenComponents = value;
        this.hiddenComponents = angular.copy(this.hiddenComponents);
    }
}

NodeGradingController.$inject = [
    '$filter',
    '$state',
    '$stateParams',
    'AnnotationService',
    'ConfigService',
    'NodeService',
    'ProjectService',
    'StudentStatusService',
    'TeacherDataService'
];

export default NodeGradingController;
