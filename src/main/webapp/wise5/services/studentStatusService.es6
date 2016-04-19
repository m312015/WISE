class StudentStatusService {
    constructor($http,
                AnnotationService,
                ConfigService,
                ProjectService) {
        this.$http = $http;
        this.AnnotationService = AnnotationService;
        this.ConfigService = ConfigService;
        this.ProjectService = ProjectService;
        this.studentStatuses = null;
    }

    retrieveStudentStatuses(config) {
        var studentStatusURL = this.ConfigService.getStudentStatusURL();
        var runId = this.ConfigService.getRunId();

        var requestConfig = {
            params: {
                runId: runId
            }
        };

        return this.$http.get(studentStatusURL, requestConfig).then((result) => {
            var studentStatuses = result.data;

            this.studentStatuses = studentStatuses;

            return studentStatuses;
        });
    };

    getStudentStatuses() {
        return this.studentStatuses;
    };

    /**
     * Get the current node position and title for a workgroup
     * e.g. 2.2: Newton Scooter Concepts
     * @param workgroupId the workgroup id
     * @returns the node position and title
     */
    getCurrentNodePositionAndNodeTitleForWorkgroupId(workgroupId) {
        var nodePositionAndTitle = null;

        var studentStatus = this.getStudentStatusForWorkgroupId(workgroupId);

        if(studentStatus != null) {
            var currentNodeId = studentStatus.currentNodeId;
            nodePositionAndTitle = this.ProjectService.getNodePositionAndTitleByNodeId(currentNodeId);
        }

        return nodePositionAndTitle;
    };

    getStudentStatusForWorkgroupId(workgroupId) {

        var studentStatus = null;
        var studentStatuses = this.getStudentStatuses();

        for (var x = 0; x < studentStatuses.length; x++) {
            var tempStudentStatus = studentStatuses[x];

            if (tempStudentStatus != null) {
                var tempWorkgroupId = tempStudentStatus.workgroupId;

                if (workgroupId == tempWorkgroupId) {
                    studentStatus = tempStudentStatus;
                    break;
                }
            }
        }

        return studentStatus;
    };

    setStudentStatusForWorkgroupId(workgroupId, studentStatus) {

        var studentStatuses = this.getStudentStatuses();

        for (var x = 0; x < studentStatuses.length; x++) {
            var tempStudentStatus = studentStatuses[x];

            if (tempStudentStatus != null) {
                var tempWorkgroupId = tempStudentStatus.workgroupId;

                if (workgroupId === tempWorkgroupId) {
                    studentStatuses.splice(x, 1, studentStatus);
                    break;
                }
            }
        }
    };

    getAvatarColorForWorkgroupId(workgroupId) {
        var avatarColors = ['#E91E63', '#9C27B0', '#CDDC39', '#2196F3', '#FDD835', '#43A047', '#795548', '#EF6C00', '#C62828', '#607D8B'];
        var modulo = workgroupId % 10;
        return avatarColors[modulo];
    };

    /**
     * Get the student project completion by workgroup id
     * @param workgroupId the workgroup id
     * @returns the project completion percentage for the given workgroup
     */
    getStudentProjectCompletion(workgroupId) {

        var completionPercentage = null;

        // get the student status for the workgroup
        var studentStatus = this.getStudentStatusForWorkgroupId(workgroupId);

        if (studentStatus != null) {

            if (studentStatus != null) {

                // get the project completion object
                var projectCompletion = studentStatus.projectCompletion;

                if (projectCompletion != null) {
                    // get the project completion percentage
                    completionPercentage = projectCompletion.completionPct;
                }
            }
        }

        return completionPercentage;
    }

    /**
     * Get the number of students on a node in the given period
     * @param nodeId the node id
     * @param periodId the period id. pass in -1 to select all periods.
     * @returns the number of students on a node in a period
     */
    getNumberOfStudentsOnNode(nodeId, periodId) {

        var count = 0;

        var studentStatuses = this.studentStatuses;

        // loop through all the student statuses
        for (var ss = 0; ss < studentStatuses.length; ss++) {
            var studentStatus = studentStatuses[ss];

            if (studentStatus != null) {

                if (periodId == -1 || periodId == studentStatus.periodId) {
                    // the period matches the one we are looking for
                    if (nodeId === studentStatus.currentNodeId) {
                        // the node id matches the one we are looking for
                        count++;
                    }
                }
            }
        }

        return count;
    }

    /**
     * Get the percentage of the period that has completed the node
     * @param nodeId the node id
     * @param periodId the period id. pass in -1 to select all periods.
     * @returns the percentage of the period that has completed the node.
     * this value will be an integer between 0-100.
     */
    getNodeCompletion(nodeId, periodId) {
        var numStudentsCompleted = 0;
        var numStudentsInPeriod = 0;

        var studentStatuses = this.studentStatuses;

        // loop through all the student statuses
        for (var ss = 0; ss < studentStatuses.length; ss++) {
            var studentStatus = studentStatuses[ss];

            if (studentStatus != null) {

                if (periodId == -1 || periodId == studentStatus.periodId) {
                    // the period matches the one we are looking for
                    numStudentsInPeriod++;

                    var nodeStatuses = studentStatus.nodeStatuses;

                    if (nodeStatuses != null) {
                        // get the node status for the node
                        var nodeStatus = nodeStatuses[nodeId];

                        if (nodeStatus != null) {
                            if (nodeStatus.isCompleted) {
                                // the student has completed the node
                                numStudentsCompleted++;
                            }
                        }
                    }
                }
            }
        }

        /*
         * generate the percentage number rounded down to the nearest integer.
         * the value will be between 0-100
         */
        var completionPercentage = Math.floor(100 * numStudentsCompleted / numStudentsInPeriod);

        return completionPercentage;
    }

    /**
     * Check if there is a workgroup that is online and on the node
     * @param studentsOnline the workgroup ids that are online
     * @param nodeId the node id
     * @param periodId the period id. pass in -1 to select all periods.
     * @returns whether there is a workgroup that is online and on the node
     */
    isWorkgroupOnlineOnNode(studentsOnline, nodeId, periodId) {

        if (studentsOnline != null) {

            // loop through all the students that are online
            for (var s = 0; s < studentsOnline.length; s++) {
                var workgroupId = studentsOnline[s];

                if (workgroupId != null) {

                    var studentStatus = this.getStudentStatusForWorkgroupId(workgroupId);

                    if (studentStatus != null) {

                        if (periodId == -1 || periodId == studentStatus.periodId) {
                            // the period matches the one we are looking for
                            if (nodeId === studentStatus.currentNodeId) {
                                // the student is on the node we are looking for
                                return true;
                            }
                        }
                    }
                }
            }
        }

        return false;
    }

    /**
     * Get the average score for a node for a period
     * @param nodeId the node id
     * @param periodId the period id. pass in -1 to select all periods.
     * @returns the average score for the node for the period
     */
    getNodeAverageScore(nodeId, periodId) {
        var studentScoreSum = 0;
        var numStudentsWithScore = 0;

        var studentStatuses = this.studentStatuses;

        // loop through all the student statuses
        for (var ss = 0; ss < studentStatuses.length; ss++) {
            var studentStatus = studentStatuses[ss];

            if (studentStatus != null) {

                if (periodId == -1 || periodId == studentStatus.periodId) {
                    // the period matches the one we are looking for

                    var workgroupId = studentStatus.workgroupId;

                    // get the workgroups score on the node
                    var score = this.AnnotationService.getScore(workgroupId, nodeId);

                    if (score != null) {
                        // increment the counter of students with a score for this node
                        numStudentsWithScore++;

                        // accumulate the sum of the scores for this node
                        studentScoreSum += score;
                    }
                }
            }
        }

        var averageScore = null;

        if (numStudentsWithScore != 0) {
            // calculate the average score for this node rounded down to the nearest hundredth
            averageScore = Math.floor(100 * studentScoreSum / numStudentsWithScore) / 100;
        }

        return averageScore;
    }
}

StudentStatusService.$inject = [
    '$http',
    'AnnotationService',
    'ConfigService',
    'ProjectService'
];

export default StudentStatusService;
