var PolicyNoteContext = (function () {
    function PolicyNoteContext() {
    }
    PolicyNoteContext.CreateContextFor = function (policyId) {
        var ctx = new PolicyNoteContext();
        ctx.policyId = policyId;
        ctx.num = null;
        ctx.comments = null;
        ctx.newText = '';
        return ctx;
    };
    return PolicyNoteContext;
})();
var PolicyService = (function () {
    function PolicyService(http) {
        this.http = http;
    }
    PolicyService.prototype.getPolicyInfoForWorkflowTask = function (workflowTaskId, includeSections, includeOrganisations) {
        if (includeSections === void 0) { includeSections = false; }
        if (includeOrganisations === void 0) { includeOrganisations = false; }
        var url = '/api/Workflow/GetPolicyLinkedToWorkflowTask?workflowTaskId=' + workflowTaskId + '&includeSections=' + includeSections + '&includeOrganisations=' + includeOrganisations;
        return this.http.get(url);
    };
    PolicyService.prototype.getPackageBasicInfo = function (policyId) {
        if (policyId) {
            var url = '/api/Policies/GetPackageBasicInfo?policyId=' + policyId;
            return this.http.get(url);
        }
    };
    PolicyService.prototype.getPoliciesByOrg = function (orgId, pageNumber, pageSize) {
        var url = '/api/policies/GetByOrganisation/?organisationId=' + orgId + '&pageNumber=' + pageNumber + '&pageSize=' + pageSize;
        return this.http.get(url);
    };
    PolicyService.prototype.getClosedPolicyFlowVersionByPev = function (pevId) {
        var url = '/api/policies/GetClosedPolicyFlowVersionByPev/?pevId=' + pevId;
        return this.http.get(url);
    };
    PolicyService.prototype.existsPoliciesWithoutPermissionForOrg = function (orgId) {
        var url = '/api/policies/ExistsPoliciesWithoutPermissionForOrg/?organisationId=' + orgId;
        return this.http.get(url);
    };
    PolicyService.prototype.getSummaryNotes = function (policyId) {
        return this.http.get('/api/policies/GetLatestPolicyNotes/' + policyId);
    };
    PolicyService.prototype.getSummarySectionNotes = function (policySectionId) {
        return this.http.get('/api/policySection/GetLatestPolicySectionNotes?policySectionId=' + policySectionId);
    };
    PolicyService.prototype.getAllNotes = function (policyId) {
        return this.http.get('/api/policies/GetAllPolicyNotes/' + policyId);
    };
    PolicyService.prototype.getAllSectionNotes = function (policySectionId) {
        return this.http.get('/api/policySection/GetAllPolicySectionNotes?policySectionId=' + policySectionId);
    };
    PolicyService.prototype.saveNote = function (policyId, comment) {
        return this.http.post('/api/policies/SaveNote/' + policyId, comment);
    };
    PolicyService.prototype.saveSectionNote = function (policySectionId, comment) {
        return this.http.post('/api/policySection/SaveNote?policySectionId=' + policySectionId, comment);
    };
    PolicyService.prototype.getCountersByPolicyId = function (policyId) {
        return this.http.get('/api/policies/GetCountersByPolicyId/' + policyId);
    };
    PolicyService.prototype.getCountersByPolicySectionId = function (policySectionId) {
        return this.http.get('/api/policySection/GetCountersByPolicySectionId?policySectionId=' + policySectionId);
    };
    PolicyService.prototype.updatePreviousPolicyNumber = function (policyId, previousPolicyNumber, isPreviousExternal) {
        var model = {
            number: previousPolicyNumber,
            isExternal: isPreviousExternal
        };
        return this.http.post('/api/policies/UpdatePreviousPolicyNumber/' + policyId, model);
    };
    PolicyService.prototype.previousPolicyNumberExists = function (policyId, previousPolicyNumber) {
        var model = {
            number: previousPolicyNumber
        };
        return this.http.post('/api/policies/PreviousPolicyNumberExists/' + policyId, model);
    };
    PolicyService.prototype.getClosedPolicyFlowVersions = function (policyId) {
        return this.http.get('/api/policies/getClosedPolicyFlowVersions/' + policyId);
    };
    PolicyService.prototype.getPolicyRenewalChainBySectionId = function (sectionId) {
        return this.http.get('/api/policies/GetPolicyRenewalChainBySectionId/?policySectionId=' + sectionId);
    };
    PolicyService.prototype.getPolicySectionVersions = function (sectionId) {
        return this.http.get('/api/policySection/GetVersionHistory?policySectionId=' + sectionId);
    };
    PolicyService.prototype.renewPackage = function (initialContext) {
        var request = {
            taskType: 'RENEW_CONTRACT',
            initialContext: initialContext
        };
        return this.http.post('/api/policyRenewalApi/RenewPackage', request);
    };
    PolicyService.prototype.copySection = function (initialContext) {
        var request = {
            taskType: 'COPY_SECTION',
            initialContext: initialContext
        };
        return this.http.post('/api/policySection/CopySection', request);
    };
    PolicyService.prototype.getPolicyFlowByWorkflowTaskId = function (workflowTaskId) {
        return this.http.get('/api/workflow/GetPolicyFlowByWorkflowTaskId?workflowTaskId=' + workflowTaskId + '&canBeNull=true');
    };
    PolicyService.prototype.search = function (currentPolicyId, term) {
        return this.http.get("/api/Policies/Search?currentPolicyId=" + currentPolicyId + "&term=" + term).then(function (response) { return response.data; });
    };
    PolicyService.prototype.getPolicyVersionBySectionId = function (policySectionId) {
        return this.http.get('/api/policySection/GetPolicyVersionByPolicySectionId?policySectionId=' + policySectionId);
    };
    PolicyService.prototype.getPolicyVersionByEndorsementId = function (endorsementId) {
        return this.http.get('/api/policySection/GetPolicyVersionByEndorsementId?endorsementId=' + endorsementId);
    };
    return PolicyService;
})();
//# sourceMappingURL=PolicyService.js.map