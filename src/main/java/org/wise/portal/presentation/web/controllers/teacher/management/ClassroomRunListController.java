/**
 * Copyright (c) 2007 Regents of the University of California (Regents). Created
 * by TELS, Graduate School of Education, University of California at Berkeley.
 *
 * This software is distributed under the GNU Lesser General Public License, v2.
 *
 * Permission is hereby granted, without written agreement and without license
 * or royalty fees, to use, copy, modify, and distribute this software and its
 * documentation for any purpose, provided that the above copyright notice and
 * the following two paragraphs appear in all copies of this software.
 *
 * REGENTS SPECIFICALLY DISCLAIMS ANY WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE. THE SOFTWAREAND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
 * HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 *
 * IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
 * SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS,
 * ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package org.wise.portal.presentation.web.controllers.teacher.management;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Required;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractController;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.project.impl.ProjectTypeVisitor;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.offering.RunService;
import org.wise.portal.service.project.ProjectService;
import org.wise.portal.service.workgroup.WorkgroupService;

/**
 * Puts run details into the model to be retrieved and displayed on
 * runlist.jsp
 *
 * @author Hiroki Terashima
 * @version $Id: RunListController.java 3192 2011-07-06 21:25:50Z honchikun@gmail.com $
 */
public class ClassroomRunListController extends AbstractController {
	
	protected static final String FALSE = "FALSE";

	protected static final String GRADING_ENABLED = "GRADING_ENABLED";

	private Properties wiseProperties;
	
	private RunService runService;

	private ProjectService projectService;

	private WorkgroupService workgroupService;

	protected final static String IS_REAL_TIME_ENABLED = "isRealTimeEnabled";

	protected final static String HTTP_TRANSPORT_KEY = "http_transport";

	protected final static String CURRENT_RUN_LIST_KEY = "current_run_list";

	protected final static String ENDED_RUN_LIST_KEY = "ended_run_list";

	protected final static String WORKGROUP_MAP_KEY = "workgroup_map";
	
	protected final static String GRADING_PARAM = "gradingParam";

	static final String DEFAULT_PREVIEW_WORKGROUP_NAME = "Preview";
	
	private static final String VIEW_NAME = "teacher/management/projectruntabs";


	/**
	 * @see org.springframework.web.servlet.mvc.AbstractController#handleRequestInternal(javax.servlet.http.HttpServletRequest,
	 *      javax.servlet.http.HttpServletResponse)
	 */
	@Override
	protected ModelAndView handleRequestInternal(
			HttpServletRequest servletRequest,
			HttpServletResponse servletResponse) throws Exception {

		boolean isRealTimeEnabled = false;
		
	    String isRealTimeEnabledStr = this.wiseProperties.getProperty("isRealTimeEnabled");
	    if (isRealTimeEnabledStr != null) {
	    	isRealTimeEnabled = Boolean.valueOf(isRealTimeEnabledStr);
	    }

		
		String gradingParam = servletRequest.getParameter(GRADING_ENABLED);
		
		if( gradingParam == null )
			gradingParam = FALSE;
		
    	ModelAndView modelAndView = new ModelAndView(VIEW_NAME);
    	ControllerUtil.addUserToModelAndView(servletRequest, modelAndView);
 
		User user = ControllerUtil.getSignedInUser();
		//List<Run> runList = this.runService.getRunList();
		
		List<Run> runList = this.runService.getRunListByOwner(user);
		runList.addAll(this.runService.getRunListBySharedOwner(user));
		// this is a temporary solution to filtering out runs that the logged-in user owns.
		// when the ACL entry permissions is figured out, we shouldn't have to do this filtering
		// start temporary code
		// hiroki commented out code 4/6/2008. remove after testing
		List<Run> runList2 = new ArrayList<Run>();
		for (Run run : runList) {
			if (run.getOwners().contains(user) || run.getSharedowners().contains(user)) {
				runList2.add(run);
			}
		}
		// end temporary code
		List<Run> current_run_list = new ArrayList<Run>();
		List<Run> ended_run_list = new ArrayList<Run>();
		Map<Run, List<Workgroup>> workgroupMap = new HashMap<Run, List<Workgroup>>();
		for (Run run : runList2) {
			List<Workgroup> workgroupList = this.workgroupService
					.getWorkgroupListByOfferingAndUser(run, user);

			workgroupMap.put(run, workgroupList);
			if (run.isEnded()) {
				ended_run_list.add(run);
			} else {
				current_run_list.add(run);
			}
			
			Project project = projectService.getById(run.getProject().getId());
			ProjectTypeVisitor typeVisitor = new ProjectTypeVisitor();
			String result = (String) project.accept(typeVisitor);
		}

		modelAndView.addObject(GRADING_PARAM, gradingParam);
		modelAndView.addObject(IS_REAL_TIME_ENABLED, isRealTimeEnabled);
		modelAndView.addObject(CURRENT_RUN_LIST_KEY, current_run_list);
		modelAndView.addObject(ENDED_RUN_LIST_KEY, ended_run_list);
		modelAndView.addObject(WORKGROUP_MAP_KEY, workgroupMap);
		return modelAndView;
	}

	/**
	 * @param workgroupService
	 *            the workgroupService to set
	 */
	@Required
	public void setWorkgroupService(WorkgroupService workgroupService) {
		this.workgroupService = workgroupService;
	}

	/**
	 * @param wiseProperties the wiseProperties to set
	 */
	public void setWiseProperties(Properties wiseProperties) {
		this.wiseProperties = wiseProperties;
	}

	/**
	 * @param offeringService
	 *            the offeringService to set
	 */
	@Required
	public void setRunService(RunService runService) {
		this.runService = runService;
	}

	/**
	 * @param projectService the projectService to set
	 */
	public void setProjectService(ProjectService projectService) {
		this.projectService = projectService;
	}

}
