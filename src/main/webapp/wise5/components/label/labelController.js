'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LabelController = function () {
    function LabelController($injector, $q, $scope, $timeout, AnnotationService, ConfigService, LabelService, NodeService, NotebookService, OpenResponseService, ProjectService, StudentAssetService, StudentDataService, UtilService) {
        var _this = this;

        _classCallCheck(this, LabelController);

        this.$injector = $injector;
        this.$q = $q;
        this.$scope = $scope;
        this.$timeout = $timeout;
        this.AnnotationService = AnnotationService;
        this.ConfigService = ConfigService;
        this.LabelService = LabelService;
        this.NodeService = NodeService;
        this.NotebookService = NotebookService;
        this.OpenResponseService = OpenResponseService;
        this.ProjectService = ProjectService;
        this.StudentAssetService = StudentAssetService;
        this.StudentDataService = StudentDataService;
        this.UtilService = UtilService;
        this.idToOrder = this.ProjectService.idToOrder;

        // the node id of the current node
        this.nodeId = null;

        // the component id
        this.componentId = null;

        // field that will hold the component content
        this.componentContent = null;

        // field that will hold the authoring component content
        this.authoringComponentContent = null;

        // holds student attachments like assets
        this.attachments = [];

        // whether the step should be disabled
        this.isDisabled = false;

        // whether the student work is dirty and needs saving
        this.isDirty = false;

        // whether the student work has changed since last submit
        this.isSubmitDirty = false;

        // message to show next to save/submit buttons
        this.saveMessage = {
            text: '',
            time: ''
        };

        // whether this component is showing previous work
        this.isShowPreviousWork = false;

        // whether the student work is for a submit
        this.isSubmit = false;

        // whether students can attach files to their work
        this.isStudentAttachmentEnabled = false;

        // whether the prompt is shown or not
        this.isPromptVisible = true;

        // whether the save button is shown or not
        this.isSaveButtonVisible = false;

        // whether the submit button is shown or not
        this.isSubmitButtonVisible = false;

        // the latest annotations
        this.latestAnnotations = null;

        // whether the new label button is shown or not
        this.isNewLabelButtonVisible = true;

        // whether the cancel button is shown or not
        this.isCancelButtonVisible = false;

        // whether the snip image button is shown or not
        this.isSnipImageButtonVisible = true;

        // the label for the notebook in thos project
        this.notebookConfig = this.NotebookService.getNotebookConfig();

        // whether the student can create new labels
        this.canCreateLabels = true;

        // whether the student can delete labels
        this.canDeleteLabels = true;

        // whether the student is in the mode to create a new label
        this.createLabelMode = false;

        // a reference to the canvas
        this.canvas = null;

        // the canvas width
        this.canvasWidth = 800;

        // the canvas height
        this.canvasHeight = 600;

        // the z index of line elements
        this.lineZIndex = 0;

        // the z index of text elements
        this.textZIndex = 1;

        // the z index of circle elements
        this.circleZIndex = 2;

        // the canvas id
        this.canvasId = 'c';

        // the background image path
        this.backgroundImage = null;

        // the message to display when the student is in create label mode
        this.newLabelMessage = 'Click on the image or ';

        // get the current node and node id
        var currentNode = this.StudentDataService.getCurrentNode();
        if (currentNode != null) {
            this.nodeId = currentNode.id;
        } else {
            this.nodeId = this.$scope.nodeId;
        }

        // get the component content from the scope
        this.componentContent = this.$scope.componentContent;

        // get the authoring component content
        this.authoringComponentContent = this.$scope.authoringComponentContent;
        this.authoringComponentContentJSONString = this.$scope.authoringComponentContentJSONString;

        /*
         * get the original component content. this is used when showing
         * previous work from another component.
         */
        this.originalComponentContent = this.$scope.originalComponentContent;

        // the mode to load the component in e.g. 'student', 'grading', 'onlyShowWork'
        this.mode = this.$scope.mode;

        this.workgroupId = this.$scope.workgroupId;
        this.teacherWorkgroupId = this.$scope.teacherWorkgroupId;

        if (this.componentContent != null) {

            // get the component id
            this.componentId = this.componentContent.id;

            // get the component state from the scope
            var componentState = this.$scope.componentState;

            if (this.componentContent.canCreateLabels != null) {
                this.canCreateLabels = this.componentContent.canCreateLabels;
            }

            if (this.componentContent.canDeleteLabels != null) {
                this.canDeleteLabels = this.componentContent.canDeleteLabels;
            }

            if (this.componentContent.width != null) {
                this.canvasWidth = this.componentContent.width;
            }

            if (this.componentContent.height != null) {
                this.canvasHeight = this.componentContent.height;
            }

            if (this.mode === 'student') {
                this.isPromptVisible = true;
                this.isSaveButtonVisible = this.componentContent.showSaveButton;
                this.isSubmitButtonVisible = this.componentContent.showSubmitButton;

                if (this.canCreateLabels) {
                    this.isNewLabelButtonVisible = true;
                } else {
                    this.isNewLabelButtonVisible = false;
                }

                // get the latest annotations
                this.latestAnnotations = this.AnnotationService.getLatestComponentAnnotations(this.nodeId, this.componentId, this.workgroupId);
            } else if (this.mode === 'grading') {
                this.isPromptVisible = true;
                this.isSaveButtonVisible = false;
                this.isSubmitButtonVisible = false;
                this.isNewLabelButtonVisible = false;
                this.isSnipImageButtonVisible = false;
                this.canDeleteLabels = false;
                this.isDisabled = true;

                if (componentState != null) {
                    this.canvasId = 'labelCanvas_' + componentState.id;
                }

                // get the latest annotations
                this.latestAnnotations = this.AnnotationService.getLatestComponentAnnotations(this.nodeId, this.componentId, this.workgroupId);
            } else if (this.mode === 'onlyShowWork') {
                this.isPromptVisible = false;
                this.isSaveButtonVisible = false;
                this.isSubmitButtonVisible = false;
                this.isNewLabelButtonVisible = false;
                this.isSnipImageButtonVisible = false;
                this.canDeleteLabels = false;
                this.isDisabled = true;
            } else if (this.mode === 'showPreviousWork') {
                this.isPromptVisible = true;
                this.isSaveButtonVisible = false;
                this.isSubmitButtonVisible = false;
                this.isNewLabelButtonVisible = false;
                this.canDeleteLabels = false;
                this.isDisabled = true;
            } else if (this.mode === 'authoring') {

                this.updateAdvancedAuthoringView();

                $scope.$watch(function () {
                    return this.authoringComponentContent;
                }.bind(this), function (newValue, oldValue) {
                    this.componentContent = this.ProjectService.injectAssetPaths(newValue);

                    if (this.canvas != null) {

                        // clear the parent to remove the canvas
                        $('#canvasParent_' + this.canvasId).empty();

                        // create a new canvas
                        var canvas = $('<canvas/>');
                        canvas.attr('id', this.canvasId);
                        canvas.css('border', '1px solid black');

                        // add the new canvas
                        $('#canvasParent_' + this.canvasId).append(canvas);

                        /*
                         * clear the background so that setupCanvas() can
                         * reapply the background
                         */
                        this.backgroundImage = null;

                        // setup the new canvas
                        this.setupCanvas();
                    }

                    if (this.componentContent.canCreateLabels != null) {
                        this.canCreateLabels = this.componentContent.canCreateLabels;
                    }

                    if (this.canCreateLabels) {
                        this.isNewLabelButtonVisible = true;
                    } else {
                        this.isNewLabelButtonVisible = false;
                    }
                }.bind(this), true);
            }

            this.$timeout(angular.bind(this, function () {
                // wait for angular to completely render the html before we initialize the canvas

                this.setupCanvas();
            }));
        }

        /**
         * Returns true iff there is student work that hasn't been saved yet
         */
        this.$scope.isDirty = function () {
            return this.$scope.labelController.isDirty;
        }.bind(this);

        /**
         * Get the component state from this component. The parent node will
         * call this function to obtain the component state when it needs to
         * save student data.
         * @param isSubmit boolean whether the request is coming from a submit
         * action (optional; default is false)
         * @return a promise of a component state containing the student data
         */
        this.$scope.getComponentState = function (isSubmit) {
            var deferred = this.$q.defer();
            var getState = false;
            var action = 'change';

            if (isSubmit) {
                if (this.$scope.labelController.isSubmitDirty) {
                    getState = true;
                    action = 'submit';
                }
            } else {
                if (this.$scope.labelController.isDirty) {
                    getState = true;
                    action = 'save';
                }
            }

            if (getState) {
                // create a component state populated with the student data
                this.$scope.labelController.createComponentState(action).then(function (componentState) {
                    deferred.resolve(componentState);
                });
            } else {
                /*
                 * the student does not have any unsaved changes in this component
                 * so we don't need to save a component state for this component.
                 * we will immediately resolve the promise here.
                 */
                deferred.resolve();
            }

            return deferred.promise;
        }.bind(this);

        /**
         * The parent node submit button was clicked
         */
        this.$scope.$on('nodeSubmitClicked', angular.bind(this, function (event, args) {

            // get the node id of the node
            var nodeId = args.nodeId;

            // make sure the node id matches our parent node
            if (this.nodeId === nodeId) {
                this.isSubmit = true;
            }
        }));

        /**
         * Listen for the 'studentWorkSavedToServer' event which is fired when
         * we receive the response from saving a component state to the server
         */
        this.$scope.$on('studentWorkSavedToServer', angular.bind(this, function (event, args) {

            var componentState = args.studentWork;

            // check that the component state is for this component
            if (componentState && this.nodeId === componentState.nodeId && this.componentId === componentState.componentId) {

                // set isDirty to false because the component state was just saved and notify node
                this.isDirty = false;
                this.$scope.$emit('componentDirty', { componentId: this.componentId, isDirty: false });

                var isAutoSave = componentState.isAutoSave;
                var isSubmit = componentState.isSubmit;
                var serverSaveTime = componentState.serverSaveTime;
                var clientSaveTime = this.ConfigService.convertToClientTimestamp(serverSaveTime);

                // set save message
                if (isSubmit) {
                    this.setSaveMessage('Submitted', clientSaveTime);

                    this.submit();

                    // set isSubmitDirty to false because the component state was just submitted and notify node
                    this.isSubmitDirty = false;
                    this.$scope.$emit('componentSubmitDirty', { componentId: this.componentId, isDirty: false });
                } else if (isAutoSave) {
                    this.setSaveMessage('Auto-saved', clientSaveTime);
                } else {
                    this.setSaveMessage('Saved', clientSaveTime);
                }
            }
        }));

        /*
         * Listen for the requestImage event which is fired when something needs
         * an image representation of the student data from a specific
         * component.
         */
        this.$scope.$on('requestImage', function (event, args) {

            // get the node id and component id from the args
            var nodeId = args.nodeId;
            var componentId = args.componentId;

            // check if the image is being requested from this component
            if (_this.nodeId === nodeId && _this.componentId === componentId) {

                // obtain the image blob
                var imageObject = _this.getImageObject();

                if (imageObject != null) {
                    var args = {};
                    args.nodeId = nodeId;
                    args.componentId = componentId;
                    args.imageObject = imageObject;

                    // fire an event that contains the image object
                    _this.$scope.$emit('requestImageCallback', args);
                }
            }
        });

        /**
         * Listen for the 'annotationSavedToServer' event which is fired when
         * we receive the response from saving an annotation to the server
         */
        this.$scope.$on('annotationSavedToServer', function (event, args) {

            if (args != null) {

                // get the annotation that was saved to the server
                var annotation = args.annotation;

                if (annotation != null) {

                    // get the node id and component id of the annotation
                    var annotationNodeId = annotation.nodeId;
                    var annotationComponentId = annotation.componentId;

                    // make sure the annotation was for this component
                    if (_this.nodeId === annotationNodeId && _this.componentId === annotationComponentId) {

                        // get latest score and comment annotations for this component
                        _this.latestAnnotations = _this.AnnotationService.getLatestComponentAnnotations(_this.nodeId, _this.componentId, _this.workgroupId);
                    }
                }
            }
        });

        /**
         * Listen for the 'exitNode' event which is fired when the student
         * exits the parent node. This will perform any necessary cleanup
         * when the student exits the parent node.
         */
        this.$scope.$on('exitNode', angular.bind(this, function (event, args) {}));

        /**
         * The student has changed the file input
         * @param element the file input element
         */
        this.$scope.fileUploadChanged = function (element) {
            var _this2 = this;

            // get the current background image if any
            var backgroundImage = this.labelController.getBackgroundImage();

            var overwrite = true;

            if (backgroundImage != null && backgroundImage != '') {
                /*
                 * there is an existing background image so we will ask the
                 * student if they want to change it
                 */
                var answer = confirm("Are you sure you want to change the background image?");

                if (answer) {
                    // the student wants to change the background image
                    overwrite = true;
                } else {
                    // the student does not want to change the background image
                    overwrite = false;

                    /*
                     * clear the input file value otherwise it will show the
                     * name of the file they recently selected but decided not
                     * to use because they decided not to change the background
                     * image
                     */
                    element.value = null;
                }
            }

            if (overwrite) {
                // we will change the current background

                // get the files from the file input element
                var files = element.files;

                if (files != null && files.length > 0) {

                    // upload the file to the studentuploads folder
                    this.labelController.StudentAssetService.uploadAsset(files[0]).then(function (unreferencedAsset) {

                        // make a referenced copy of the unreferenced asset
                        _this2.labelController.StudentAssetService.copyAssetForReference(unreferencedAsset).then(function (referencedAsset) {

                            if (referencedAsset != null) {
                                // get the url of the referenced asset
                                var imageURL = referencedAsset.url;

                                if (imageURL != null && imageURL != '') {

                                    // set the referenced asset as the background image
                                    _this2.labelController.setBackgroundImage(imageURL);
                                    _this2.labelController.studentDataChanged();
                                }
                            }
                        });
                    });
                }
            }
        };
    }

    _createClass(LabelController, [{
        key: 'setupCanvas',
        value: function setupCanvas() {
            // initialize the canvas
            var canvas = this.initializeCanvas();
            this.canvas = canvas;

            // get the component state from the scope
            var componentState = this.$scope.componentState;

            if (this.canDeleteLabels && !this.disabled) {
                // create the key down listener to listen for the delete key
                this.createKeydownListener();
            }

            // set whether studentAttachment is enabled
            this.isStudentAttachmentEnabled = this.componentContent.isStudentAttachmentEnabled;

            if (componentState == null) {
                /*
                 * only import work if the student does not already have
                 * work for this component
                 */

                // check if we need to import work
                var importPreviousWorkNodeId = this.componentContent.importPreviousWorkNodeId;
                var importPreviousWorkComponentId = this.componentContent.importPreviousWorkComponentId;

                if (importPreviousWorkNodeId == null || importPreviousWorkNodeId == '') {
                    /*
                     * check if the node id is in the field that we used to store
                     * the import previous work node id in
                     */
                    importPreviousWorkNodeId = this.componentContent.importWorkNodeId;
                }

                if (importPreviousWorkComponentId == null || importPreviousWorkComponentId == '') {
                    /*
                     * check if the component id is in the field that we used to store
                     * the import previous work component id in
                     */
                    importPreviousWorkComponentId = this.componentContent.importWorkComponentId;
                }

                if (importPreviousWorkNodeId != null && importPreviousWorkComponentId != null) {
                    // import the work from the other component
                    this.importWork();
                } else if (this.componentContent.labels != null) {
                    /*
                     * the student has not done any work and there are starter labels
                     * so we will populate the canvas with the starter labels
                     */
                    this.addLabelsToCanvas(this.componentContent.labels);
                }
            } else {
                // populate the student work into this component
                this.setStudentWork(componentState);
            }

            // get the background image that may have been set by the student data
            var backgroundImage = this.getBackgroundImage();

            if (backgroundImage == null && this.componentContent.backgroundImage != null) {
                // get the background image from the component content if any
                this.setBackgroundImage(this.componentContent.backgroundImage);
            }

            // check if we need to lock this component
            this.calculateDisabled();

            if (this.$scope.$parent.nodeController != null) {
                // register this component with the parent node
                this.$scope.$parent.nodeController.registerComponentController(this.$scope, this.componentContent);
            }
        }

        /**
         * Populate the student work into the component
         * @param componentState the component state to populate into the component
         */

    }, {
        key: 'setStudentWork',
        value: function setStudentWork(componentState) {

            if (componentState != null) {

                var studentData = componentState.studentData;

                if (studentData != null) {

                    // get the labels from the student data
                    var labels = studentData.labels;

                    // add the labels to the canvas
                    this.addLabelsToCanvas(labels);

                    // get the background image from the student data
                    var backgroundImage = studentData.backgroundImage;

                    if (backgroundImage != null) {
                        this.setBackgroundImage(backgroundImage);
                    }

                    this.processLatestSubmit();
                }
            }
        }
    }, {
        key: 'processLatestSubmit',


        /**
         * Check if latest component state is a submission and set isSubmitDirty accordingly
         */
        value: function processLatestSubmit() {
            var latestState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(this.nodeId, this.componentId);

            if (latestState) {
                var serverSaveTime = latestState.serverSaveTime;
                var clientSaveTime = this.ConfigService.convertToClientTimestamp(serverSaveTime);
                if (latestState.isSubmit) {
                    // latest state is a submission, so set isSubmitDirty to false and notify node
                    this.isSubmitDirty = false;
                    this.$scope.$emit('componentSubmitDirty', { componentId: this.componentId, isDirty: false });
                    // set save message
                    this.setSaveMessage('Last submitted', clientSaveTime);
                } else {
                    // latest state is not a submission, so set isSubmitDirty to true and notify node
                    this.isSubmitDirty = true;
                    this.$scope.$emit('componentSubmitDirty', { componentId: this.componentId, isDirty: true });
                    // set save message
                    this.setSaveMessage('Last saved', clientSaveTime);
                }
            }
        }
    }, {
        key: 'addLabelsToCanvas',


        /**
         * Add labels ot the canvas
         * @param labels an array of objects that contain the values for a label
         */
        value: function addLabelsToCanvas(labels) {
            if (labels != null) {

                // loop through all the labels
                for (var x = 0; x < labels.length; x++) {

                    // get a label
                    var label = labels[x];

                    if (label != null) {

                        // get the values of the label
                        var pointX = label.pointX;
                        var pointY = label.pointY;
                        var textX = label.textX;
                        var textY = label.textY;
                        var text = label.text;
                        var color = label.color;

                        // create the label
                        var label = this.createLabel(pointX, pointY, textX, textY, text, color);

                        // add the label to the canvas
                        this.addLabelToCanvas(this.canvas, label);
                    }
                }
            }
        }
    }, {
        key: 'saveButtonClicked',


        /**
         * Called when the student clicks the save button
         */
        value: function saveButtonClicked() {
            this.isSubmit = false;

            // tell the parent node that this component wants to save
            this.$scope.$emit('componentSaveTriggered', { nodeId: this.nodeId, componentId: this.componentId });
        }
    }, {
        key: 'submitButtonClicked',


        /**
         * Called when the student clicks the submit button
         */
        value: function submitButtonClicked() {
            this.isSubmit = true;

            // tell the parent node that this component wants to submit
            this.$scope.$emit('componentSubmitTriggered', { nodeId: this.nodeId, componentId: this.componentId });
        }
    }, {
        key: 'newLabelButtonClicked',


        /**
         * Called when the student clicks on the new label button to enter
         * create label mode
         */
        value: function newLabelButtonClicked() {
            this.createLabelMode = true;
            this.isCancelButtonVisible = true;
        }
    }, {
        key: 'cancelButtonClicked',


        /**
         * Called when the student clicks on the cancel button to exit
         * create label mode
         */
        value: function cancelButtonClicked() {
            this.createLabelMode = false;
            this.isCancelButtonVisible = false;
        }
    }, {
        key: 'submit',
        value: function submit() {
            // check if we need to lock the component after the student submits
            if (this.isLockAfterSubmit()) {
                this.isDisabled = true;
            }
        }
    }, {
        key: 'studentDataChanged',


        /**
         * Called when the student changes their work
         */
        value: function studentDataChanged() {
            var _this3 = this;

            /*
             * set the dirty flags so we will know we need to save or submit the
             * student work later
             */
            this.isDirty = true;
            this.$scope.$emit('componentDirty', { componentId: this.componentId, isDirty: true });

            this.isSubmitDirty = true;
            this.$scope.$emit('componentSubmitDirty', { componentId: this.componentId, isDirty: true });

            // clear out the save message
            this.setSaveMessage('', null);

            // get this part id
            var componentId = this.getComponentId();

            /*
             * the student work in this component has changed so we will tell
             * the parent node that the student data will need to be saved.
             * this will also notify connected parts that this component's student
             * data has changed.
             */
            var action = 'change';

            // create a component state populated with the student data
            this.createComponentState(action).then(function (componentState) {

                _this3.processLatestSubmit();
                _this3.$scope.$emit('componentStudentDataChanged', { componentId: componentId, componentState: componentState });
            });
        }
    }, {
        key: 'getLabels',


        /**
         * Get the label objects from the canvas
         * @returns an array of simple JSON objects that represent the labels
         */
        value: function getLabels() {
            var labels = [];

            // get all the objects from the canvas
            var objects = this.canvas.getObjects();

            if (objects != null) {

                // loop through all the objects
                for (var x = 0; x < objects.length; x++) {
                    var object = objects[x];

                    if (object != null) {

                        // get the object type
                        var type = object.get('type');

                        if (type === 'circle') {
                            /*
                             * the object is a circle which contains all the data
                             * for a label
                             */

                            // get the simple JSON object that represents the label
                            var labelJSONObject = this.getLabelJSONObjectFromCircle(object);

                            if (labelJSONObject != null) {
                                // add the object to our array of labels
                                labels.push(labelJSONObject);
                            }
                        }
                    }
                }
            }

            return labels;
        }
    }, {
        key: 'getLabelJSONObjectFromCircle',


        /**
         * Get the simple JSON object that represents the label
         * @param circle a Fabric circle object
         * @returns a simple JSON object that represents the label
         */
        value: function getLabelJSONObjectFromCircle(circle) {
            var labelJSONObject = {};

            if (circle != null) {

                // get the line associated with the circle
                var lineObject = circle.line;

                // get the text object associated with the circle
                var textObject = circle.text;

                if (lineObject != null && textObject != null) {

                    // get the position of the circle
                    var pointX = circle.get('left');
                    var pointY = circle.get('top');

                    /*
                     * get the offset of the end of the line
                     * (this is where the text object is also located)
                     */
                    var xDiff = lineObject.x2 - lineObject.x1;
                    var yDiff = lineObject.y2 - lineObject.y1;

                    // get the position of the text object
                    var textX = xDiff;
                    var textY = yDiff;

                    // get the text and background color of the text
                    var text = textObject.text;
                    var color = textObject.backgroundColor;

                    // set all the values into the object
                    labelJSONObject.pointX = parseInt(pointX);
                    labelJSONObject.pointY = parseInt(pointY);
                    labelJSONObject.textX = parseInt(textX);
                    labelJSONObject.textY = parseInt(textY);
                    labelJSONObject.text = text;
                    labelJSONObject.color = color;
                }
            }

            return labelJSONObject;
        }
    }, {
        key: 'createComponentState',


        /**
         * Create a new component state populated with the student data
         * @param action the action that is triggering creating of this component state
         * e.g. 'submit', 'save', 'change'
         * @return a promise that will return a component state
         */
        value: function createComponentState(action) {

            // create a new component state
            var componentState = this.NodeService.createNewComponentState();

            // set the labels into the student data
            var studentData = {};
            studentData.labels = this.getLabels();

            var backgroundImage = this.getBackgroundImage();

            if (backgroundImage != null) {
                studentData.backgroundImage = backgroundImage;
            }

            //studentData.attachments = this.attachments;

            if (this.isSubmit) {
                // the student submitted this work
                componentState.isSubmit = this.isSubmit;

                /*
                 * reset the isSubmit value so that the next component state
                 * doesn't maintain the same value
                 */
                this.isSubmit = false;
            }

            // set the student data into the component state
            componentState.studentData = studentData;

            var deferred = this.$q.defer();

            /*
             * perform any additional processing that is required before returning
             * the component state
             */
            this.createComponentStateAdditionalProcessing(deferred, componentState, action);

            return deferred.promise;
        }
    }, {
        key: 'createComponentStateAdditionalProcessing',


        /**
         * Perform any additional processing that is required before returning the
         * component state
         * Note: this function must call deferred.resolve() otherwise student work
         * will not be saved
         * @param deferred a deferred object
         * @param componentState the component state
         * @param action the action that we are creating the component state for
         * e.g. 'submit', 'save', 'change'
         */
        value: function createComponentStateAdditionalProcessing(deferred, componentState, action) {
            /*
             * we don't need to perform any additional processing so we can resolve
             * the promise immediately
             */
            deferred.resolve(componentState);
        }

        /**
         * Check if we need to lock the component
         */

    }, {
        key: 'calculateDisabled',
        value: function calculateDisabled() {

            // get the component content
            var componentContent = this.componentContent;

            if (componentContent != null) {

                // check if the parent has set this component to disabled
                if (componentContent.isDisabled) {
                    this.isDisabled = true;
                } else if (componentContent.lockAfterSubmit) {
                    // we need to lock the component after the student has submitted

                    // get the component states for this component
                    var componentStates = this.StudentDataService.getComponentStatesByNodeIdAndComponentId(this.nodeId, this.componentId);

                    // check if any of the component states were submitted
                    var isSubmitted = this.NodeService.isWorkSubmitted(componentStates);

                    if (isSubmitted) {
                        // the student has submitted work for this component
                        this.isDisabled = true;
                    }
                }
            }
        }
    }, {
        key: 'showNewLabelButton',


        /**
         * Check whether we need to show the new label button
         * @returns whether to show the new label button
         */
        value: function showNewLabelButton() {
            return this.isNewLabelButtonVisible;
        }
    }, {
        key: 'showCancelButton',


        /**
         * Check whether we need to show the cancel button
         * @returns whether to show the cancel button
         */
        value: function showCancelButton() {
            return this.isCancelButtonVisible;
        }
    }, {
        key: 'isLockAfterSubmit',


        /**
         * Check whether we need to lock the component after the student
         * submits an answer.
         */
        value: function isLockAfterSubmit() {
            var result = false;

            if (this.componentContent != null) {

                // check the lockAfterSubmit field in the component content
                if (this.componentContent.lockAfterSubmit) {
                    result = true;
                }
            }

            return result;
        }
    }, {
        key: 'removeAttachment',
        value: function removeAttachment(attachment) {
            if (this.attachments.indexOf(attachment) != -1) {
                this.attachments.splice(this.attachments.indexOf(attachment), 1);
                this.studentDataChanged();
            }
        }
    }, {
        key: 'attachStudentAsset',
        value: function attachStudentAsset(studentAsset) {
            var _this4 = this;

            if (studentAsset != null) {
                this.StudentAssetService.copyAssetForReference(studentAsset).then(function (copiedAsset) {
                    if (copiedAsset != null) {
                        var attachment = {
                            studentAssetId: copiedAsset.id,
                            iconURL: copiedAsset.iconURL
                        };

                        _this4.attachments.push(attachment);
                        _this4.studentDataChanged();
                    }
                });
            }
        }
    }, {
        key: 'getPrompt',


        /**
         * Get the prompt to show to the student
         */
        value: function getPrompt() {
            var prompt = null;

            if (this.originalComponentContent != null) {
                // this is a show previous work component

                if (this.originalComponentContent.showPreviousWorkPrompt) {
                    // show the prompt from the previous work component
                    prompt = this.componentContent.prompt;
                } else {
                    // show the prompt from the original component
                    prompt = this.originalComponentContent.prompt;
                }
            } else if (this.componentContent != null) {
                prompt = this.componentContent.prompt;
            }

            return prompt;
        }
    }, {
        key: 'importWork',


        /**
         * Import work from another component
         */
        value: function importWork() {

            // get the component content
            var componentContent = this.componentContent;

            if (componentContent != null) {

                // get the import previous work node id and component id
                var importPreviousWorkNodeId = componentContent.importPreviousWorkNodeId;
                var importPreviousWorkComponentId = componentContent.importPreviousWorkComponentId;

                if (importPreviousWorkNodeId == null || importPreviousWorkNodeId == '') {

                    /*
                     * check if the node id is in the field that we used to store
                     * the import previous work node id in
                     */
                    if (componentContent.importWorkNodeId != null && componentContent.importWorkNodeId != '') {
                        importPreviousWorkNodeId = componentContent.importWorkNodeId;
                    }
                }

                if (importPreviousWorkComponentId == null || importPreviousWorkComponentId == '') {

                    /*
                     * check if the component id is in the field that we used to store
                     * the import previous work component id in
                     */
                    if (componentContent.importWorkComponentId != null && componentContent.importWorkComponentId != '') {
                        importPreviousWorkComponentId = componentContent.importWorkComponentId;
                    }
                }

                if (importPreviousWorkNodeId != null && importPreviousWorkComponentId != null) {

                    // get the latest component state for this component
                    var componentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(this.nodeId, this.componentId);

                    /*
                     * we will only import work into this component if the student
                     * has not done any work for this component
                     */
                    if (componentState == null) {
                        // the student has not done any work for this component

                        // get the latest component state from the component we are importing from
                        var importWorkComponentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(importPreviousWorkNodeId, importPreviousWorkComponentId);

                        if (importWorkComponentState != null) {
                            /*
                             * populate a new component state with the work from the
                             * imported component state
                             */
                            var populatedComponentState = this.LabelService.populateComponentState(importWorkComponentState);

                            // populate the component state into this component
                            this.setStudentWork(populatedComponentState);
                        }
                    }
                }
            }
        }
    }, {
        key: 'getComponentId',


        /**
         * Get the component id
         * @return the component id
         */
        value: function getComponentId() {
            return this.componentContent.id;
        }
    }, {
        key: 'initializeCanvas',


        /**
         * Initialize the canvas
         * @returns the canvas object
         */
        value: function initializeCanvas() {

            var canvas = null;

            this.canvasWidth = this.componentContent.width;
            this.canvasHeight = this.componentContent.height;

            // get the canvas object from the html
            if (this.isDisabled) {
                // we will make the canvas uneditable
                canvas = new fabric.StaticCanvas(this.canvasId);
            } else {
                // make the canvas editable
                canvas = new fabric.Canvas(this.canvasId);
            }

            // disable selection of items
            canvas.selection = false;

            // change the cursor to a hand when it is hovering over an object
            canvas.hoverCursor = 'pointer';

            // set the width and height of the canvas
            canvas.setWidth(this.canvasWidth);
            canvas.setHeight(this.canvasHeight);

            // set the height on the parent div so that a vertical scrollbar doesn't show up
            $('#canvasParent_' + this.canvasId).css('height', this.canvasHeight + 2);

            // listen for the mouse down event
            canvas.on('mouse:down', angular.bind(this, function (options) {

                // get the object that was clicked on if any
                var activeObject = this.canvas.getActiveObject();

                if (activeObject == null) {
                    /*
                     * no objects in the canvas were clicked. the user clicked
                     * on a blank area of the canvas so we will unselect any label
                     * that was selected and turn off edit label mode
                     */
                    this.selectedLabel = null;
                    this.editLabelMode = false;
                }

                // check if the student is in create label mode
                if (this.createLabelMode) {
                    /*
                     * the student is in create label mode so we will create a new label
                     * where they have clicked
                     */

                    // turn off create label mode and hide the cancel button
                    this.createLabelMode = false;
                    this.isCancelButtonVisible = false;

                    var event = options.e;

                    if (event != null) {
                        // get the x and y position that the student clicked on
                        var x = event.layerX;
                        var y = event.layerY;

                        /*
                         * set the location of the text object to be down to the right
                         * of the position the student clicked on
                         */
                        var textX = 100;
                        var textY = 100;

                        // create a new label
                        var newLabel = this.createLabel(x, y, textX, textY, 'A new label', 'blue');

                        // add the label to the canvas
                        this.addLabelToCanvas(this.canvas, newLabel);

                        /*
                         * make the new label selected so that the student can edit
                         * the text
                         */
                        this.selectLabel(newLabel);

                        // notify others that the student data has changed
                        this.studentDataChanged();
                    }
                }
            }));

            // listen for the object moving event
            canvas.on('object:moving', angular.bind(this, function (options) {
                var target = options.target;

                if (target != null) {

                    // get the type of the object that is moving
                    var type = target.get('type');

                    // get the position of the element
                    var left = target.get('left');
                    var top = target.get('top');

                    // limit the x position to the canvas
                    if (left < 0) {
                        target.set('left', 0);
                        left = 0;
                    } else if (left > this.canvasWidth) {
                        target.set('left', this.canvasWidth);
                        left = this.canvasWidth;
                    }

                    // limit the y position to the canvas
                    if (top < 0) {
                        target.set('top', 0);
                        top = 0;
                    } else if (top > this.canvasHeight) {
                        target.set('top', this.canvasHeight);
                        top = this.canvasHeight;
                    }

                    if (type === 'circle') {
                        /*
                         * the student is moving the point of the label so we need to update
                         * the endpoint of the line and the position of the text element.
                         * the endpoint of the line and the position of the text element should
                         * maintain the relative position to the point.
                         */

                        // get the line associated with the circle
                        var line = target.line;

                        var xDiff = 0;
                        var yDiff = 0;

                        if (line != null) {
                            // calculate the relative offset of the end of the line
                            xDiff = line.x2 - line.x1;
                            yDiff = line.y2 - line.y1;

                            // set the new position of the two endpoints of the line
                            line.set({ x1: left, y1: top, x2: left + xDiff, y2: top + yDiff });

                            // remove and add the line to refresh the element in the canvas
                            canvas.remove(line);
                            canvas.add(line);

                            // set the z index so it will be below the circle and text elements
                            canvas.moveTo(line, this.lineZIndex);
                        }

                        // get the text element
                        var text = target.text;

                        if (text != null) {
                            // set the new position of the text element
                            text.set({ left: left + xDiff, top: top + yDiff });

                            // remove and add the line to refresh the element in the canvas
                            canvas.remove(text);
                            canvas.add(text);

                            // set the z index so it will be above line elements and below circle elements
                            canvas.moveTo(text, this.textZIndex);
                        }
                    } else if (type === 'i-text') {
                        /*
                         * the student is moving the text of the label so we need to update
                         * the endpoint of the line. the endpoint of the line should be in
                         * the same position as the text element.
                         */

                        var line = target.line;

                        if (line != null) {
                            // set the new position of the text element
                            line.set({ x2: left, y2: top });

                            // remove and add the line to refresh the element in the canvas
                            canvas.remove(line);
                            canvas.add(line);

                            // set the z index so it will be below the circle and text elements
                            canvas.moveTo(line, this.lineZIndex);
                        }
                    }

                    // refresh the canvas
                    canvas.renderAll();

                    // notify others that the student data has changed
                    this.studentDataChanged();
                }
            }));

            // listen for the text changed event
            canvas.on('text:changed', angular.bind(this, function (options) {
                var target = options.target;

                if (target != null) {

                    var type = target.get('type');

                    if (type === 'i-text') {
                        // notify others that the student data has changed
                        this.studentDataChanged();
                    }
                }
            }));

            return canvas;
        }
    }, {
        key: 'setBackgroundImage',


        /**
         * Set the background image
         * @param backgroundImagePath the url path to an image
         */
        value: function setBackgroundImage(backgroundImagePath) {

            if (backgroundImagePath != null) {
                this.backgroundImage = backgroundImagePath;
                this.canvas.setBackgroundImage(backgroundImagePath, this.canvas.renderAll.bind(this.canvas));
            }
        }
    }, {
        key: 'getBackgroundImage',


        /**
         * Get the background image
         * @returns the background image path
         */
        value: function getBackgroundImage() {
            return this.backgroundImage;
        }
    }, {
        key: 'createKeydownListener',


        /**
         * Create the keydown listener that we will use for deleting labels
         */
        value: function createKeydownListener() {
            window.addEventListener('keydown', angular.bind(this, this.keyPressed), false);
        }
    }, {
        key: 'keyPressed',


        /**
         * The callback handler for the keydown event
         * @param e the event
         */
        value: function keyPressed(e) {

            // get the key code of the key that was pressed
            var keyCode = e.keyCode;

            // 8 is backspace and 46 is delete
            if (keyCode === 8 || keyCode === 46) {

                // get the active object
                var activeObject = this.canvas.getActiveObject();

                if (activeObject != null) {

                    // make sure the active object is a circle which represents the label
                    if (activeObject.get('type') === 'circle') {

                        // remove the label from the canvas
                        this.removeLabelFromCanvas(this.canvas, activeObject);

                        // notify others that the student data has changed
                        this.studentDataChanged();
                    }
                }
            }
        }
    }, {
        key: 'createLabel',


        /**
         * Create a label object. The label object is represented by a circle
         * element (the point), a line element, and a text element. The circle
         * element will contain a reference to the line and text elements. The
         * text element will contain a reference to the line element.
         * @param pointX the x position of the point (circle)
         * @param pointY the y position of the point (circle)
         * @param textX the x position of the text relative to the point (circle)
         * @param textY the y position of the text relative to the point (circle)
         * @param textString the text of the label
         * @param color the background color of the label
         * @returns an object containing a circle, line, and text
         */
        value: function createLabel(pointX, pointY, textX, textY, textString, color) {
            var label = {};

            // get the position of the point
            var x1 = pointX;
            var y1 = pointY;

            // get the absolute position of the text
            var x2 = pointX + textX;
            var y2 = pointY + textY;

            if (color == null) {
                // the default background color for text elements will be blue
                color = 'blue';
            }

            // create a circle element
            var circle = new fabric.Circle({
                radius: 5,
                left: x1,
                top: y1,
                originX: 'center',
                originY: 'center',
                hasControls: false,
                borderColor: 'red',
                hasBorders: true,
                selectable: true
            });

            // create a line element
            var line = new fabric.Line([x1, y1, x2, y2], {
                fill: 'black',
                stroke: 'black',
                strokeWidth: 3,
                selectable: false
            });

            // create an editable text element
            var text = new fabric.IText(textString, {
                left: x2,
                top: y2,
                originX: 'center',
                originY: 'center',
                fontSize: 20,
                fill: 'white',
                backgroundColor: color,
                width: 100,
                hasControls: false,
                hasBorders: true,
                borderColor: 'red',
                selectable: true,
                cursorWidth: 0,
                editable: false
            });

            // give the circle a reference to the line and text elements
            circle.line = line;
            circle.text = text;

            // give the text element a reference to the line element
            text.line = line;

            // add the circle, line, and text elements to the label object
            label.circle = circle;
            label.line = line;
            label.text = text;

            return label;
        }
    }, {
        key: 'addLabelToCanvas',


        /**
         * Add a label to canvas
         * @param canvas the canvas
         * @param label an object that contains a Fabric circle, Fabric line,
         * and Fabric itext elements
         */
        value: function addLabelToCanvas(canvas, label) {
            var _this5 = this;

            if (canvas != null && label != null) {

                // get the circle, line and text elements
                var circle = label.circle;
                var line = label.line;
                var text = label.text;

                if (circle != null && line != null && text != null) {

                    // add the elements to the canvas
                    canvas.add(circle, line, text);

                    // set the z indexes for the elements
                    canvas.moveTo(line, this.lineZIndex);
                    canvas.moveTo(text, this.textZIndex);
                    canvas.moveTo(circle, this.circleZIndex);

                    // refresh the canvas
                    canvas.renderAll();

                    circle.on('selected', function () {
                        /*
                         * the circle was clicked so we will make the associated
                         * label selected
                         */
                        _this5.selectLabel(label);
                    });

                    text.on('selected', function () {
                        /*
                         * the text was clicked so we will make the associated
                         * label selected
                         */
                        _this5.selectLabel(label);
                    });
                }
            }
        }
    }, {
        key: 'selectLabel',


        /**
         * Make the label selected which means we will show the UI elements to
         * allow the text to be edited and the label to deleted.
         * @param label the label object
         */
        value: function selectLabel(label) {

            // create a reference to the selected label
            this.selectedLabel = label;

            /*
             * remember the label text before the student changes it in case the
             * student wants to cancel any changes they make
             */
            this.selectedLabelText = label.text.text;

            // turn on edit label mode
            this.editLabelMode = true;

            /*
             * force angular to refresh, otherwise angular will wait until the
             * user generates another input (such as moving the mouse) before
             * refreshing
             */
            this.$scope.$apply();
        }

        /**
         * The student has changed the label text on the selected label
         * @param textObject the label's canvas text object
         * @param text the text string
         */

    }, {
        key: 'selectedLabelTextChanged',
        value: function selectedLabelTextChanged(textObject, text) {

            // set the text into the object
            textObject.setText(text);

            // notify the controller that the student data has changed
            this.studentDataChanged();

            // refresh the canvas
            this.canvas.renderAll();
        }

        /**
         * Remove a label from the canvas
         * @param canvas the canvas
         * @param label the Fabric circle element that represents the label
         */

    }, {
        key: 'removeLabelFromCanvas',
        value: function removeLabelFromCanvas(canvas, label) {

            if (canvas != null && label != null) {

                // get the circle, line, and text elements
                var circle = label;
                var line = label.line;
                var text = label.text;

                if (circle != null && line != null && text != null) {

                    // remove the elements from the canvas
                    canvas.remove(circle);
                    canvas.remove(line);
                    canvas.remove(text);

                    // refresh the canvas
                    canvas.renderAll();
                }
            }
        }
    }, {
        key: 'authoringViewComponentChanged',


        /**
         * The component has changed in the regular authoring view so we will save the project
         */
        value: function authoringViewComponentChanged() {

            // update the JSON string in the advanced authoring view textarea
            this.updateAdvancedAuthoringView();

            /*
             * notify the parent node that the content has changed which will save
             * the project to the server
             */
            this.$scope.$parent.nodeAuthoringController.authoringViewNodeChanged();
        }
    }, {
        key: 'advancedAuthoringViewComponentChanged',


        /**
         * The component has changed in the advanced authoring view so we will update
         * the component and save the project.
         */
        value: function advancedAuthoringViewComponentChanged() {

            try {
                /*
                 * create a new component by converting the JSON string in the advanced
                 * authoring view into a JSON object
                 */
                var authoringComponentContent = angular.fromJson(this.authoringComponentContentJSONString);

                // replace the component in the project
                this.ProjectService.replaceComponent(this.nodeId, this.componentId, authoringComponentContent);

                // set the new authoring component content
                this.authoringComponentContent = authoringComponentContent;

                // set the component content
                this.componentContent = this.ProjectService.injectAssetPaths(authoringComponentContent);

                /*
                 * notify the parent node that the content has changed which will save
                 * the project to the server
                 */
                this.$scope.$parent.nodeAuthoringController.authoringViewNodeChanged();
            } catch (e) {
                this.$scope.$parent.nodeAuthoringController.showSaveErrorAdvancedAuthoring();
            }
        }
    }, {
        key: 'updateAdvancedAuthoringView',


        /**
         * Update the component JSON string that will be displayed in the advanced authoring view textarea
         */
        value: function updateAdvancedAuthoringView() {
            this.authoringComponentContentJSONString = angular.toJson(this.authoringComponentContent, 4);
        }
    }, {
        key: 'authoringShowPreviousWorkClicked',


        /**
         * The show previous work checkbox was clicked
         */
        value: function authoringShowPreviousWorkClicked() {

            if (!this.authoringComponentContent.showPreviousWork) {
                /*
                 * show previous work has been turned off so we will clear the
                 * show previous work node id, show previous work component id, and
                 * show previous work prompt values
                 */
                this.authoringComponentContent.showPreviousWorkNodeId = null;
                this.authoringComponentContent.showPreviousWorkComponentId = null;
                this.authoringComponentContent.showPreviousWorkPrompt = null;

                // the authoring component content has changed so we will save the project
                this.authoringViewComponentChanged();
            }
        }

        /**
         * The show previous work node id has changed
         */

    }, {
        key: 'authoringShowPreviousWorkNodeIdChanged',
        value: function authoringShowPreviousWorkNodeIdChanged() {

            if (this.authoringComponentContent.showPreviousWorkNodeId == null || this.authoringComponentContent.showPreviousWorkNodeId == '') {

                /*
                 * the show previous work node id is null so we will also set the
                 * show previous component id to null
                 */
                this.authoringComponentContent.showPreviousWorkComponentId = '';
            }

            // the authoring component content has changed so we will save the project
            this.authoringViewComponentChanged();
        }

        /**
         * The show previous work component id has changed
         */

    }, {
        key: 'authoringShowPreviousWorkComponentIdChanged',
        value: function authoringShowPreviousWorkComponentIdChanged() {

            // get the show previous work node id
            var showPreviousWorkNodeId = this.authoringComponentContent.showPreviousWorkNodeId;

            // get the show previous work prompt boolean value
            var showPreviousWorkPrompt = this.authoringComponentContent.showPreviousWorkPrompt;

            // get the old show previous work component id
            var oldShowPreviousWorkComponentId = this.componentContent.showPreviousWorkComponentId;

            // get the new show previous work component id
            var newShowPreviousWorkComponentId = this.authoringComponentContent.showPreviousWorkComponentId;

            // get the new show previous work component
            var newShowPreviousWorkComponent = this.ProjectService.getComponentByNodeIdAndComponentId(showPreviousWorkNodeId, newShowPreviousWorkComponentId);

            if (newShowPreviousWorkComponent == null || newShowPreviousWorkComponent == '') {
                // the new show previous work component is empty

                // save the component
                this.authoringViewComponentChanged();
            } else if (newShowPreviousWorkComponent != null) {

                // get the current component type
                var currentComponentType = this.componentContent.type;

                // get the new component type
                var newComponentType = newShowPreviousWorkComponent.type;

                // check if the component types are different
                if (newComponentType != currentComponentType) {
                    /*
                     * the component types are different so we will need to change
                     * the whole component
                     */

                    // make sure the author really wants to change the component type
                    var answer = confirm('Are you sure you want to change this component type?');

                    if (answer) {
                        // the author wants to change the component type

                        /*
                         * get the component service so we can make a new instance
                         * of the component
                         */
                        var componentService = this.$injector.get(newComponentType + 'Service');

                        if (componentService != null) {

                            // create a new component
                            var newComponent = componentService.createComponent();

                            // set move over the values we need to keep
                            newComponent.id = this.authoringComponentContent.id;
                            newComponent.showPreviousWork = true;
                            newComponent.showPreviousWorkNodeId = showPreviousWorkNodeId;
                            newComponent.showPreviousWorkComponentId = newShowPreviousWorkComponentId;
                            newComponent.showPreviousWorkPrompt = showPreviousWorkPrompt;

                            /*
                             * update the authoring component content JSON string to
                             * change the component
                             */
                            this.authoringComponentContentJSONString = JSON.stringify(newComponent);

                            // update the component in the project and save the project
                            this.advancedAuthoringViewComponentChanged();
                        }
                    } else {
                        /*
                         * the author does not want to change the component type so
                         * we will rollback the showPreviousWorkComponentId value
                         */
                        this.authoringComponentContent.showPreviousWorkComponentId = oldShowPreviousWorkComponentId;
                    }
                } else {
                    /*
                     * the component types are the same so we do not need to change
                     * the component type and can just save
                     */
                    this.authoringViewComponentChanged();
                }
            }
        }

        /**
         * Get all the step node ids in the project
         * @returns all the step node ids
         */

    }, {
        key: 'getStepNodeIds',
        value: function getStepNodeIds() {
            var stepNodeIds = this.ProjectService.getNodeIds();

            return stepNodeIds;
        }

        /**
         * Get the step number and title
         * @param nodeId get the step number and title for this node
         * @returns the step number and title
         */

    }, {
        key: 'getNodePositionAndTitleByNodeId',
        value: function getNodePositionAndTitleByNodeId(nodeId) {
            var nodePositionAndTitle = this.ProjectService.getNodePositionAndTitleByNodeId(nodeId);

            return nodePositionAndTitle;
        }

        /**
         * Get the components in a step
         * @param nodeId get the components in the step
         * @returns the components in the step
         */

    }, {
        key: 'getComponentsByNodeId',
        value: function getComponentsByNodeId(nodeId) {
            var components = this.ProjectService.getComponentsByNodeId(nodeId);

            return components;
        }

        /**
         * Check if a node is a step node
         * @param nodeId the node id to check
         * @returns whether the node is an application node
         */

    }, {
        key: 'isApplicationNode',
        value: function isApplicationNode(nodeId) {
            var result = this.ProjectService.isApplicationNode(nodeId);

            return result;
        }

        /**
         * Add a label in the authoring view
         */

    }, {
        key: 'authoringAddLabelClicked',
        value: function authoringAddLabelClicked() {

            // create the new label
            var newLabel = {};
            newLabel.text = 'Enter text here';
            newLabel.color = 'blue';
            newLabel.pointX = 100;
            newLabel.pointY = 100;
            newLabel.textX = 100;
            newLabel.textY = -25;

            // add the label to the array of labels
            this.authoringComponentContent.labels.push(newLabel);

            // save the project
            this.authoringViewComponentChanged();
        }

        /**
         * Delete a label in the authoring view
         * @param index the index of the label in the labels array
         */

    }, {
        key: 'authoringDeleteLabelClicked',
        value: function authoringDeleteLabelClicked(index) {

            // delete the label from the array
            this.authoringComponentContent.labels.splice(index, 1);

            // save the project
            this.authoringViewComponentChanged();
        }

        /**
         * Get the image object representation of the student data
         * @returns an image object
         */

    }, {
        key: 'getImageObject',
        value: function getImageObject() {
            var pngFile = null;

            if (this.canvas != null) {

                // get the image as a base64 string
                var img_b64 = this.canvas.toDataURL('image/png');

                // get the image object
                pngFile = this.UtilService.getImageObjectFromBase64String(img_b64);
            }

            return pngFile;
        }

        /**
         * Set the message next to the save button
         * @param message the message to display
         * @param time the time to display
         */

    }, {
        key: 'setSaveMessage',
        value: function setSaveMessage(message, time) {
            this.saveMessage.text = message;
            this.saveMessage.time = time;
        }
    }, {
        key: 'showSnipImageButton',


        /**
         * Check whether we need to show the snip image button
         * @return whether to show the snip image button
         */
        value: function showSnipImageButton() {
            if (this.NotebookService.isNotebookEnabled() && this.isSnipImageButtonVisible) {
                return true;
            } else {
                return false;
            }
        }

        /**
         * Snip the labels by converting it to an image
         * @param $event the click event
         */

    }, {
        key: 'snipImage',
        value: function snipImage($event) {

            // get the canvas element
            var canvas = angular.element('#' + this.componentId + ' canvas');

            if (canvas != null && canvas.length > 0) {

                // get the top canvas
                canvas = canvas[0];

                // get the canvas as a base64 string
                var img_b64 = canvas.toDataURL('image/png');

                // get the image object
                var imageObject = this.UtilService.getImageObjectFromBase64String(img_b64);

                // create a notebook item with the image populated into it
                this.NotebookService.addNewItem($event, imageObject);
            }
        }

        /**
         * Register the the listener that will listen for the exit event
         * so that we can perform saving before exiting.
         */

    }, {
        key: 'registerExitListener',
        value: function registerExitListener() {

            /*
             * Listen for the 'exit' event which is fired when the student exits
             * the VLE. This will perform saving before the VLE exits.
             */
            this.exitListener = this.$scope.$on('exit', angular.bind(this, function (event, args) {}));
        }
    }, {
        key: 'componentHasWork',


        /**
         * Check if a component generates student work
         * @param component the component
         * @return whether the component generates student work
         */
        value: function componentHasWork(component) {
            var result = true;

            if (component != null) {
                result = this.ProjectService.componentHasWork(component);
            }

            return result;
        }

        /**
         * The import previous work checkbox was clicked
         */

    }, {
        key: 'authoringImportPreviousWorkClicked',
        value: function authoringImportPreviousWorkClicked() {

            if (!this.authoringComponentContent.importPreviousWork) {
                /*
                 * import previous work has been turned off so we will clear the
                 * import previous work node id, and import previous work
                 * component id
                 */
                this.authoringComponentContent.importPreviousWorkNodeId = null;
                this.authoringComponentContent.importPreviousWorkComponentId = null;

                // the authoring component content has changed so we will save the project
                this.authoringViewComponentChanged();
            }
        }

        /**
         * The import previous work node id has changed
         */

    }, {
        key: 'authoringImportPreviousWorkNodeIdChanged',
        value: function authoringImportPreviousWorkNodeIdChanged() {

            if (this.authoringComponentContent.importPreviousWorkNodeId == null || this.authoringComponentContent.importPreviousWorkNodeId == '') {

                /*
                 * the import previous work node id is null so we will also set the
                 * import previous component id to null
                 */
                this.authoringComponentContent.importPreviousWorkComponentId = '';
            }

            // the authoring component content has changed so we will save the project
            this.authoringViewComponentChanged();
        }

        /**
         * The import previous work component id has changed
         */

    }, {
        key: 'authoringImportPreviousWorkComponentIdChanged',
        value: function authoringImportPreviousWorkComponentIdChanged() {

            // the authoring component content has changed so we will save the project
            this.authoringViewComponentChanged();
        }

        /**
         * The student clicked the save button in the edit label mode
         */

    }, {
        key: 'saveLabelButtonClicked',
        value: function saveLabelButtonClicked() {

            if (this.selectedLabel != null) {
                /*
                 * we do not need to perform any saving of the text since it has
                 * already been handled by the ng-model for the label text
                 */

                /*
                 * remove the reference to the selected label since it will no
                 * longer be selected
                 */
                this.selectedLabel = null;

                // turn off edit label mode
                this.editLabelMode = false;

                // make the canvas object no longer the active object
                this.canvas.discardActiveObject();
            }
        }

        /**
         * The student clicked the cancel button in the edit label mode
         */

    }, {
        key: 'cancelLabelButtonClicked',
        value: function cancelLabelButtonClicked() {

            if (this.selectedLabel != null) {

                // get the label text before the student recently made changes to it
                var selectedLabelText = this.selectedLabelText;

                // revert the label text to what it was before
                this.selectedLabel.text.setText(selectedLabelText);

                // clear the label text holder
                this.selectedLabelText = null;

                /*
                 * remove the reference to the selected label since it will no
                 * longer be selected
                 */
                this.selectedLabel = null;

                // turn off edit label mode
                this.editLabelMode = false;

                // make the canvas object no longer the active object
                this.canvas.discardActiveObject();

                // notify others that the student data has changed
                this.studentDataChanged();

                // refresh the canvas
                this.canvas.renderAll();
            }
        }

        /**
         * The student clicked the delete button in the edit label mode
         */

    }, {
        key: 'deleteLabelButtonClicked',
        value: function deleteLabelButtonClicked() {

            if (this.selectedLabel != null) {

                // get the text from the label we are going to delete
                var selectedLabelText = this.selectedLabel.text.text;

                // confirm with the student that they want to delete the label
                var answer = confirm('Are you sure you want to delete this label?\n\n' + selectedLabelText);

                if (answer) {
                    // the student is sure they want to delete the label

                    /*
                     * get the circle from the label since the circle has
                     * references to the line and text for the label
                     */
                    var circle = this.selectedLabel.circle;

                    if (circle != null) {

                        // remove the label from the canvas
                        this.removeLabelFromCanvas(this.canvas, circle);

                        /*
                         * remove the reference to the selected label since it will no
                         * longer be selected
                         */
                        this.selectedLabel = null;

                        // turn off edit label mode
                        this.editLabelMode = false;

                        // make the canvas object no longer the active object
                        this.canvas.discardActiveObject();

                        // notify others that the student data has changed
                        this.studentDataChanged();
                    }
                }
            }
        }
    }]);

    return LabelController;
}();

LabelController.$inject = ['$injector', '$q', '$scope', '$timeout', 'AnnotationService', 'ConfigService', 'LabelService', 'NodeService', 'NotebookService', 'OpenResponseService', 'ProjectService', 'StudentAssetService', 'StudentDataService', 'UtilService'];

exports.default = LabelController;
//# sourceMappingURL=labelController.js.map