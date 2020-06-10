loadJsFile(`${__dirname}/PolicySectionTimelineDirective.js`);

describe('splitScreen.PolicySectionTimelineDirective directive', () => {
    let $rootScope;
    let $scope;
    let $compile;
    let policyServiceMock;

    function setupScopeProperties(rootScope) {
        return Object.assign(rootScope, {
            policySectionId: 1,
            showTimeline: true,
            endorsementId: 1,
            openEndorsement: null,
            exitEndorsementMode: null
        });
    }

    beforeEach(() => {
        angular.mock.module('app', function ($provide) {
            $provide.constant('baseUrl', 'THE_SERVER_URL');
            $provide.value('defaultDateFilter', function () {
                return "01 Jan 2010";
            });
            $provide.service('policyService', function ($q) {
                policyServiceMock = {
                    getPolicySectionVersions: jest.fn().mockReturnValue(
                        $q.when({
                        data: [
                            {
                                quoteId: 1,
                                endorsementId: 1,
                                type: "Type 1",
                                startDate: "2019-01-01",
                                endDate: "2019-02-01",
                                status: "Status",
                                createDate: "2019-01-01"
                            },
                            {
                                quoteId: 2,
                                endorsementId: 2,
                                type: "Type 2",
                                startDate: "2019-01-01",
                                endDate: "2019-02-01",
                                status: "Status 2",
                                createDate: "2019-01-01"
                            }
                        ]})
                    ),
                }

                return policyServiceMock;
            });
        });
    });

    beforeEach(inject(function (_$rootScope_, _$compile_, _$controller_) {
        $compile = _$compile_;
        $rootScope = setupScopeProperties(_$rootScope_);
        ctrl = _$controller_;
        $scope = $rootScope.$new();
    }));

    function createElement() {
        return $compile(
          `<policy-section-timeline
            policy-section-id="policySectionId" 
            show-timeline="showTimeline" 
            endorsement-id="endorsementId" 
            open-endorsement="openEndorsement"
            exit-endorsement-mode="exitEndorsementMode"></policy-section-timeline>`
        )($scope);
    }

    test('should render the template', () => {
        const element = createElement();
        $scope.$digest();
        expect(element.html().trim().length).toBeGreaterThan(0);
    });

    describe('controller', () => {
        let ctrl;

        function getController() {
          const element = createElement();
          $scope.$digest();
          return element.controller('policySectionTimeline');
        }

        beforeEach(() => {
          ctrl = getController();
        });

        describe('getPolicySectionVersions', () => {
            test('it sets proper parameters', () => {
                ctrl.getPolicySectionVersions(1);
                $scope.$apply();

                expect(ctrl.policySectionVersions.length).toEqual(2);

                expect(ctrl.selectedPolicySection).toEqual(
                    expect.objectContaining({
                        quoteId: 1
                    })
                );

                expect(ctrl.firstCreatedPolicySectionVersionId).toEqual(2);

                expect(ctrl.policySectionIsSelected).toEqual(true);
            });
        });

        describe('selectPolicySectionVersion', () => {
            test('it sets selectedPolicySectionVersion', () => {
                ctrl.selectPolicySectionVersion({quoteId: 3});
                $scope.$apply();

                expect(ctrl.selectedPolicySection).toEqual(
                    expect.objectContaining({
                        quoteId: 3
                    })
                );
            });
        });
    });
});