var Policy;
(function (Policy) {
    var PolicySectionVersionComparatorDirective = (function () {
        function PolicySectionVersionComparatorDirective(baseUrl) {
            return {
                restrict: 'E',
                scope: {
                    linkFloatRight: '=?',
                    newQuoteId: '=',
                    endorsementId: '=',
                    policySectionVersions: '=',
                    showComparator: '=',
                    openEndorsement: '&?',
                    exitEndorsementMode: '&?'
                },
                controller: PolicySectionVersionComparatorController,
                controllerAs: 'policySectionVersionCompCtrl',
                bindToController: true,
                templateUrl: "" + baseUrl + "/Content/ngviews/policy/policySectionVersionComparator.html"
            };
        }
        PolicySectionVersionComparatorDirective.$inject = ['baseUrl'];
        return PolicySectionVersionComparatorDirective;
    })();
    Policy.PolicySectionVersionComparatorDirective = PolicySectionVersionComparatorDirective;
    var PolicySectionVersionComparatorController = (function () {
        function PolicySectionVersionComparatorController($scope, $filter, quoteComparatorService) {
            var _this = this;
            this.$filter = $filter;
            this.scope = $scope;
            this.differencesNumber = 0;
            this.quoteComparatorService = quoteComparatorService;
            this.loadComparisonData();
            this.scope.$watch(function () { return _this.newQuoteId; }, function (newValue, oldValue) {
                if (newValue != oldValue) {
                    _this.loadComparisonData();
                }
            });
            this.scope.$watch(function () { return _this.showComparator; }, function (newValue, oldValue) {
                if (newValue != oldValue) {
                    _this.loadComparisonData();
                }
            });
        }
        PolicySectionVersionComparatorController.prototype.switchToVersion = function (endorsementId) {
            if (endorsementId)
                this.openEndorsement({ endorsementId: endorsementId });
            else
                this.exitEndorsementMode();
            this.showComparator = false;
        };
        PolicySectionVersionComparatorController.prototype.loadComparisonData = function () {
            var _this = this;
            if (!this.endorsementId)
                this.endorsementId = 0;
            this.newPolicySectionData = this.policySectionVersions.filter(function (ps) { return ps.quoteId == _this.newQuoteId; })[0];
            if (this.policySectionVersions.length > 1) {
                if (this.endorsementId)
                    this.oldPolicySectionData = this.policySectionVersions.filter(function (ps) { return ps.endorsementId == _this.endorsementId; })[0];
                else
                    this.oldPolicySectionData = this.policySectionVersions.filter(function (ps) { return ps.endorsementId == 0; })[0];
                if (this.oldPolicySectionData.quoteId == this.newPolicySectionData.quoteId)
                    return;
                this.quoteComparatorService.compareQuotes(this.oldPolicySectionData.quoteId, this.newPolicySectionData.quoteId).then(function (response) {
                    _this.differencesNumber = 0;
                    _this.comparatorResults = response.data;
                    _this.formatResults(_this.comparatorResults);
                });
            }
        };
        PolicySectionVersionComparatorController.prototype.isCollapsed = function (index) {
            return this.collapsedSections[index];
        };
        PolicySectionVersionComparatorController.prototype.toggleContent = function (index) {
            this.collapsedSections[index] = !this.collapsedSections[index];
        };
        PolicySectionVersionComparatorController.prototype.toggleAll = function () {
            var areAllExpanded = this.areAllExpanded();
            for (var i = 0; i < this.collapsedSections.length; i++) {
                this.collapsedSections[i] = areAllExpanded;
            }
        };
        PolicySectionVersionComparatorController.prototype.areAllExpanded = function () {
            var areAllExpanded = true;
            for (var i = 0; i < this.collapsedSections.length; i++) {
                if (this.collapsedSections[i]) {
                    areAllExpanded = false;
                    break;
                }
            }
            return areAllExpanded;
        };
        PolicySectionVersionComparatorController.prototype.formatResults = function (resultsList) {
            var previousSection = null;
            var simpleResults = [];
            this.sections = [];
            this.collapsedSections = [];
            for (var i = 0; i < resultsList.length; i++) {
                if (resultsList[i].section != previousSection) {
                    if (previousSection != null) {
                        this.sections.push({
                            name: previousSection,
                            results: simpleResults,
                            diffCount: this.sectionDiffCounter
                        });
                        this.collapsedSections.push(false);
                    }
                    this.sectionDiffCounter = 0;
                    previousSection = resultsList[i].section;
                    simpleResults = [];
                }
                switch (resultsList[i].kindOfObject) {
                    case 'Simple':
                        var diff = resultsList[i];
                        this.applyDateFilterIfNeeded(diff);
                        simpleResults.push(diff);
                        this.differencesNumber += 1;
                        this.sectionDiffCounter += 1;
                        break;
                    case 'Complex':
                        var complexDiffs = this.makeSimpleList(resultsList[i].differences);
                        simpleResults = simpleResults.concat(complexDiffs);
                        this.differencesNumber += complexDiffs.length;
                        this.sectionDiffCounter += complexDiffs.length;
                        break;
                    case 'Collection':
                        var collectionDiffs = this.makeCollectionSimple(resultsList[i]);
                        simpleResults = simpleResults.concat(collectionDiffs);
                        this.differencesNumber += collectionDiffs.length;
                        this.sectionDiffCounter += collectionDiffs.length;
                        break;
                }
            }
            if (resultsList.length > 0) {
                this.sections.push({
                    name: previousSection,
                    results: simpleResults,
                    diffCount: this.sectionDiffCounter
                });
                this.collapsedSections.push(false);
            }
        };
        PolicySectionVersionComparatorController.prototype.applyDateFilterIfNeeded = function (diff) {
            if (this.IsDate(diff.fieldType))
                diff.newValue = this.$filter('defaultDate')(diff.newValue);
            if (this.IsDate(diff.fieldType))
                diff.oldValue = this.$filter('defaultDate')(diff.oldValue);
        };
        PolicySectionVersionComparatorController.prototype.makeSimpleList = function (resultsList) {
            var simpleList = [];
            for (var i = 0; i < resultsList.length; i++) {
                if (resultsList[i].kindOfObject == 'Simple') {
                    var diff = resultsList[i];
                    this.applyDateFilterIfNeeded(diff);
                    simpleList.push(diff);
                }
                else if (resultsList[i].kindOfObject == 'Complex') {
                    if (resultsList[i].differences.length > 0) {
                        simpleList = simpleList.concat(this.makeSimpleList(resultsList[i].differences));
                    }
                }
                else if (resultsList[i].kindOfObject == 'Collection') {
                    if (resultsList[i].differences.length > 0) {
                        simpleList = simpleList.concat(this.makeCollectionSimple(resultsList[i]));
                    }
                }
            }
            return simpleList;
        };
        PolicySectionVersionComparatorController.prototype.makeCollectionSimple = function (resultsList) {
            var simpleCollectionList = [];
            var subSection = resultsList.label + ' List';
            for (var i = 0; i < resultsList.differences.length; i++) {
                var difference = resultsList.differences[i];
                var objectResults = [];
                var newValues = [];
                var oldValues = [];
                var labels = [];
                if (difference.newValue) {
                    for (var key in difference.newValue) {
                        newValues.push(difference.newValue[key]);
                        labels.push(key);
                    }
                }
                if (difference.oldValue) {
                    for (var key in difference.oldValue) {
                        oldValues.push(difference.oldValue[key]);
                        if (newValues.length == 0)
                            labels.push(key);
                    }
                }
                for (var j = 0; j < labels.length; j++) {
                    var newValue = '';
                    var oldValue = '';
                    if (typeof newValues[j] == 'object') {
                        newValue = '';
                    }
                    else {
                        newValue = newValues[j] ? newValues[j] : '';
                        if (this.IsDate(newValue))
                            newValue = this.$filter('defaultDate')(newValue);
                    }
                    if (typeof oldValues[j] == 'object') {
                        oldValue = '';
                    }
                    else {
                        oldValue = oldValues[j] ? oldValues[j] : '';
                        if (this.IsDate(oldValue))
                            oldValue = this.$filter('defaultDate')(oldValue);
                    }
                    objectResults.push({
                        label: labels[j],
                        newValue: newValue,
                        oldValue: oldValue
                    });
                }
                simpleCollectionList.push({
                    subsection: subSection,
                    isFirst: i == 0 ? true : false,
                    results: objectResults
                });
            }
            return simpleCollectionList;
        };
        PolicySectionVersionComparatorController.prototype.IsDate = function (fieldType) {
            return fieldType === 'dateTime';
        };
        PolicySectionVersionComparatorController.$inject = ['$scope', '$filter', 'quoteComparatorService'];
        return PolicySectionVersionComparatorController;
    })();
    Policy.PolicySectionVersionComparatorController = PolicySectionVersionComparatorController;
})(Policy || (Policy = {}));
angular.module('app').directive('policySectionVersionComparator', Policy.PolicySectionVersionComparatorDirective);
//# sourceMappingURL=PolicySectionVersionComparatorDirective.js.map