var Policy;
(function (Policy) {
    var SelectorDirective = (function () {
        function SelectorDirective(baseUrl) {
            return {
                scope: {
                    currentPolicyId: '@',
                    mainTitle: '@',
                    secondaryTitle: '@',
                    selectorButtonText: '@',
                    acceptSelectionButtonText: '@',
                    noDataText: '@',
                    singleSelection: '&',
                    selectPolicies: '&',
                    onAcceptSelection: '&'
                },
                restrict: 'E',
                controller: Controller,
                controllerAs: 'ctrl',
                bindToController: true,
                templateUrl: "" + baseUrl + "/Content/ngviews/policy/policySelector.html"
            };
        }
        SelectorDirective.$inject = ['baseUrl'];
        return SelectorDirective;
    })();
    Policy.SelectorDirective = SelectorDirective;
    var Controller = (function () {
        function Controller($scope, policyService) {
            var _this = this;
            this.policyService = policyService;
            this.searchResults = [];
            this.filteredSearchResults = [];
            this.selectedItems = [];
            this.searchLoading = false;
            this.selectorOpened = false;
            $scope.$watch(function () { return _this.selectedItems; }, function () {
                _this.filteredSearchResults = _this.selectPolicies() ? _this.getAvailablePolicyResults() : _this.getAvailablePolicySectionResults();
            }, true);
        }
        Controller.prototype.handleSearch = function (searchTerm) {
            var _this = this;
            if (!searchTerm || searchTerm.trim().length === 0)
                return;
            this.searchLoading = true;
            return this.policyService.search(Number(this.currentPolicyId), searchTerm).then(function (results) {
                _this.searchResults = results;
                _this.filteredSearchResults = results;
            }).finally(function () {
                _this.searchLoading = false;
            });
        };
        Controller.prototype.handleSelectPolicy = function (policy) {
            if (this.singleSelection())
                this.handlePolicySingleSelection(policy);
            else
                this.handlePolicyMultiSelection(policy);
        };
        Controller.prototype.handlePolicySingleSelection = function (policy) {
            this.selectedItems = [policy];
        };
        Controller.prototype.handlePolicyMultiSelection = function (policy) {
            if (this.findSelectedPolicy(policy.PolicyId))
                return;
            this.selectedItems.push(policy);
        };
        Controller.prototype.handleSelectPolicySection = function (selectedPolicySection, selectedPolicy) {
            if (this.singleSelection())
                this.handlePolicySectionSingleSelection(selectedPolicy, selectedPolicySection);
            else
                this.handlePolicySectionMultiSelection(selectedPolicy, selectedPolicySection);
        };
        Controller.prototype.handlePolicySectionMultiSelection = function (selectedPolicy, selectedPolicySection) {
            var existingSelectedPolicy = this.findSelectedPolicy(selectedPolicy.PolicyId);
            if (existingSelectedPolicy) {
                if (!existingSelectedPolicy.PolicySections.find(function (ps) { return ps.PolicySectionId === selectedPolicySection.PolicySectionId; }))
                    existingSelectedPolicy.PolicySections.push(selectedPolicySection);
            }
            else {
                var copiedPolicy = angular.copy(selectedPolicy);
                copiedPolicy.PolicySections = [selectedPolicySection];
                this.selectedItems.push(copiedPolicy);
            }
        };
        Controller.prototype.findSelectedPolicy = function (policyId) {
            return this.selectedItems.find(function (p) { return p.PolicyId === policyId; });
        };
        Controller.prototype.handlePolicySectionSingleSelection = function (selectedPolicy, selectedPolicySection) {
            var copiedPolicy = angular.copy(selectedPolicy);
            copiedPolicy.PolicySections = [selectedPolicySection];
            this.selectedItems = [copiedPolicy];
        };
        Controller.prototype.acceptSelection = function () {
            this.toggleSelector();
            this.onAcceptSelection({
                selectedItems: this.selectedItems
            });
            this.selectedItems = [];
        };
        Controller.prototype.toggleSelector = function () {
            this.selectorOpened = !this.selectorOpened;
        };
        Controller.prototype.getAvailablePolicySectionResults = function () {
            var selectedPolicySectionIds = this.selectedItems.reduce(function (agg, cur) {
                cur.PolicySections.map(function (ps) { return ps.PolicySectionId; }).forEach(function (psId) {
                    agg.add(psId);
                });
                return agg;
            }, new Set());
            return this.searchResults.reduce(function (agg, cur) {
                var newItem = angular.copy(cur);
                newItem.PolicySections = newItem.PolicySections.filter(function (ps) { return !selectedPolicySectionIds.has(ps.PolicySectionId); });
                if (newItem.PolicySections.length > 0)
                    agg.push(newItem);
                return agg;
            }, []);
        };
        Controller.prototype.getAvailablePolicyResults = function () {
            var selectedPolicyIds = this.selectedItems.reduce(function (agg, cur) { return agg.add(cur.PolicyId); }, new Set());
            return this.searchResults.filter(function (p) { return !selectedPolicyIds.has(p.PolicyId); });
        };
        Controller.$inject = ['$scope', 'policyService'];
        return Controller;
    })();
})(Policy || (Policy = {}));
angular.module('app').directive('policySelector', Policy.SelectorDirective);
//# sourceMappingURL=PolicySelectorDirective.js.map