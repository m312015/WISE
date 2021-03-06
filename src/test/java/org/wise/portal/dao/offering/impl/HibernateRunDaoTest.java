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
package org.wise.portal.dao.offering.impl;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;

import org.hibernate.Session;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.dao.group.impl.HibernateGroupDao;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.domain.authentication.impl.PersistentUserDetails;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.group.impl.PersistentGroup;
import org.wise.portal.domain.module.Curnit;
import org.wise.portal.domain.module.impl.CurnitImpl;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.project.impl.ProjectImpl;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.run.impl.RunImpl;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.user.impl.UserImpl;
import org.wise.portal.junit.AbstractTransactionalDbTests;

/**
 * Test class for HibernateRunDao
 * 
 * @author Hiroki Terashima
 * @version $Id$
 */
public class HibernateRunDaoTest extends AbstractTransactionalDbTests {

    private static final String DEFAULT_NAME = "Airbags";

    private static final String DEFAULT_URL = "http://mrpotatoiscoolerthanwoody.com";


	private static final MutableUserDetails DEFAULT_USER_DETAILS = new PersistentUserDetails();

	private static Set<User> DEFAULT_OWNERS = new HashSet<User>();
	
	private static User DEFAULT_OWNER = new UserImpl();

	private static Project DEFAULT_PROJECT = new ProjectImpl();

	private static final Curnit DEFAULT_CURNIT = new CurnitImpl();

    private Group DEFAULT_GROUP_1, DEFAULT_GROUP_2, DEFAULT_GROUP_3;

    private final Date DEFAULT_STARTTIME = Calendar.getInstance().getTime();

    private Date DEFAULT_ENDTIME = null;

    private final String DEFAULT_RUNCODE = "diamonds12345";

    private final String RUNCODE_NOT_IN_DB = "diamonds54321";

    private RunImpl defaultRun;

    private HibernateRunDao runDao;

    private HibernateGroupDao groupDao;
    
    /**
     * @param defaultRun
     *                the defaultRun to set
     */
    public void setDefaultRun(RunImpl defaultRun) {
        this.defaultRun = defaultRun;
    }

    /**
     * @param runDao
     *                the runDao to set
     */
    public void setOfferingDao(HibernateRunDao runDao) {
        this.runDao = runDao;
    }

	/**
	 * @param groupDao the groupDao to set
	 */
	public void setGroupDao(HibernateGroupDao groupDao) {
		this.groupDao = groupDao;
	}
	
    /**
     * @see net.sf.sail.webapp.junit.AbstractTransactionalDbTests#onSetUpBeforeTransaction()
     */
    @Override
    protected void onSetUpBeforeTransaction() throws Exception {
        super.onSetUpBeforeTransaction();

        DEFAULT_GROUP_1 = new PersistentGroup();
        DEFAULT_GROUP_1.setName("Period 1");

        DEFAULT_GROUP_2 = new PersistentGroup();
        DEFAULT_GROUP_2.setName("Period 2");

        DEFAULT_GROUP_3 = new PersistentGroup();
        DEFAULT_GROUP_3.setName("Period 3");

        this.defaultRun.setStarttime(DEFAULT_STARTTIME);
        this.defaultRun.setRuncode(DEFAULT_RUNCODE);
        
        DEFAULT_USER_DETAILS.setPassword(DEFAULT_NAME);
        DEFAULT_USER_DETAILS.setUsername(DEFAULT_NAME);
        DEFAULT_OWNER.setUserDetails(DEFAULT_USER_DETAILS);

        DEFAULT_OWNERS = new HashSet<User>();
        DEFAULT_OWNERS.add(DEFAULT_OWNER);
        
        DEFAULT_PROJECT.setCurnit(DEFAULT_CURNIT);
    }

    /**
     * @see net.sf.sail.webapp.junit.AbstractTransactionalDbTests#onSetUpInTransaction()
     */
    @Override
    protected void onSetUpInTransaction() throws Exception {
        super.onSetUpInTransaction();
        Session session = this.sessionFactory.getCurrentSession();
        session.save(DEFAULT_USER_DETAILS);
        session.save(DEFAULT_OWNER);  // save owner
        session.save(DEFAULT_CURNIT);  // save curnit
        session.save(DEFAULT_PROJECT);  // save project

        this.defaultRun.setOwners(DEFAULT_OWNERS);
        this.defaultRun.setProject(DEFAULT_PROJECT);
    }

    /**
     * @see net.sf.sail.webapp.junit.AbstractTransactionalDbTests#onTearDownAfterTransaction()
     */
    @Override
    protected void onTearDownAfterTransaction() throws Exception {
        super.onTearDownAfterTransaction();
        this.defaultRun = null;
    }
    
    public void testSave() {
        verifyRunAndJoinTablesAreEmpty();

        this.defaultRun.setOwners(DEFAULT_OWNERS);
        this.runDao.save(this.defaultRun);
        // flush is required to cascade the join table for some reason
        this.toilet.flush();

        List<?> runsList = retrieveRunListFromDb();
        assertEquals(1, runsList.size());
        // TODO HT: figure out why this works when this test class is run individually,
        // but not when you do mvn test
//        assertEquals(1, retrieveRunsAndOwnersListFromDb().size());
//        assertEquals(1, retrieveRunsRelatedToOwnersListFromDb().size());
        assertEquals(0, retrieveRunsRelatedToGroupsListFromDb().size());
        assertEquals(0, retrieveRunsAndGroupsListFromDb().size());

        Map<?, ?> runMap = (Map<?, ?>) runsList.get(0);
        assertEquals(this.DEFAULT_STARTTIME, runMap
                .get(RunImpl.COLUMN_NAME_STARTTIME.toUpperCase()));
        assertEquals(this.DEFAULT_RUNCODE, runMap.get(RunImpl.COLUMN_NAME_RUN_CODE
                .toUpperCase()));
        assertNull(runMap.get(RunImpl.COLUMN_NAME_ENDTIME.toUpperCase()));

        // now add groups to the run
        Set<Group> periods = new TreeSet<Group>();
        periods.add(DEFAULT_GROUP_1);
        periods.add(DEFAULT_GROUP_2);
        this.defaultRun.setPeriods(periods);
        this.groupDao.save(DEFAULT_GROUP_1);
        this.groupDao.save(DEFAULT_GROUP_2);
        
        this.runDao.save(this.defaultRun);
        // flush is required to cascade the join table for some reason
        this.toilet.flush();

        runsList = retrieveRunListFromDb();
        List<?> allList = retrieveRunsAndGroupsListFromDb();
        assertEquals(1, runsList.size());
        assertEquals(2, retrieveRunsRelatedToGroupsListFromDb().size());
        assertEquals(2, allList.size());

        List<String> periodNames = new ArrayList<String>();
        periodNames.add(DEFAULT_GROUP_1.getName());
        periodNames.add(DEFAULT_GROUP_2.getName());

        for (int i = 0; i < allList.size(); i++) {
            Map<?, ?> allRunMap = (Map<?, ?>) allList.get(i);
            String periodName = (String) allRunMap
                    .get(PersistentGroup.COLUMN_NAME_NAME);
            assertTrue(periodNames.contains(periodName));
            periodNames.remove(periodName);
        }

        // now "end/archive the run"
        this.DEFAULT_ENDTIME = Calendar.getInstance().getTime();
        this.defaultRun.setEndtime(this.DEFAULT_ENDTIME);

        this.runDao.save(this.defaultRun);
        // flush is required to cascade the join table for some reason
        this.toilet.flush();

        runsList = retrieveRunListFromDb();
        runMap = (Map<?, ?>) runsList.get(0);
        assertEquals(this.DEFAULT_ENDTIME, runMap.get(RunImpl.COLUMN_NAME_ENDTIME
                .toUpperCase()));

    }

    public void testSave_withoutProject() {
    	// test saving the run without setting the project. Should fail
        verifyRunAndJoinTablesAreEmpty();

        this.defaultRun.setProject(null);
        try {
        	this.runDao.save(this.defaultRun);
        	fail("Exception expected to be thrown but was not");
        } catch (Exception e) {
        }
    }
    
    // test the retrieveByRunCode() method of HiberateRunDao
    public void testRetrieveByRunCode() throws Exception {
        verifyRunAndJoinTablesAreEmpty();

        this.runDao.save(this.defaultRun);
        // flush is required to cascade the join table for some reason
        this.toilet.flush();

        // get Run record from persistent data store and confirm it is
        // complete
        Run run = this.runDao.retrieveByRunCode(DEFAULT_RUNCODE);
        assertTrue(run instanceof RunImpl);
        assertTrue(RunImpl.class == run.getClass());

        assertEquals(DEFAULT_RUNCODE, run.getRuncode());
        assertEquals(DEFAULT_STARTTIME, run.getStarttime());

        // user the same runcode but with all uppercase and make sure
        // it can be retrieved
        run = this.runDao.retrieveByRunCode(DEFAULT_RUNCODE.toUpperCase());
        assertTrue(run instanceof RunImpl);
        assertTrue(RunImpl.class == run.getClass());

        assertEquals(DEFAULT_RUNCODE, run.getRuncode());
        assertEquals(DEFAULT_STARTTIME, run.getStarttime());
        
        // choose random non-existent runcode and try to retrieve
        try{
        	this.runDao.retrieveByRunCode(RUNCODE_NOT_IN_DB);
        	fail ("Expected ObjectNotFoundException");
        }
        catch (ObjectNotFoundException e) {}
    }
    
    public void testGetById() throws Exception {
        verifyRunAndJoinTablesAreEmpty();

        this.runDao.save(this.defaultRun);

        assertNotNull(this.runDao.getById(this.defaultRun.getId()));
    }

    private void verifyRunAndJoinTablesAreEmpty() {
        assertTrue(this.retrieveRunListFromDb().isEmpty());
        assertTrue(this.retrieveRunsRelatedToGroupsListFromDb().isEmpty());
        assertTrue(this.retrieveRunsAndOwnersListFromDb().isEmpty());
    }

    /*
     * SELECT * FROM runs_related_to_groups
     */
    private List<?> retrieveRunsRelatedToGroupsListFromDb() {
        return this.jdbcTemplate.queryForList("SELECT * FROM "
                + RunImpl.PERIODS_JOIN_TABLE_NAME);
    }
    
    /*
     * SELECT * FROM runs_related_to_owners
     */
    @SuppressWarnings("unused")
	private List<?> retrieveRunsRelatedToOwnersListFromDb() {
        return this.jdbcTemplate.queryForList("SELECT * FROM "
                + RunImpl.OWNERS_JOIN_TABLE_NAME);
    }

    /*
     * SELECT * FROM runs
     */
    private List<?> retrieveRunListFromDb() {
        return this.jdbcTemplate.queryForList("SELECT * FROM "
                + RunImpl.DATA_STORE_NAME, (Object[]) null);
    }

    /*
     * SELECT * FROM runs, runs_related_to_groups, groups WHERE runs.id =
     * runs_related_to_groups.run_fk AND groups.id =
     * runs_related_to_groups.group_fk
     */
    private List<?> retrieveRunsAndGroupsListFromDb() {
        return this.jdbcTemplate.queryForList("SELECT * FROM "
                + RunImpl.DATA_STORE_NAME + ", " + RunImpl.PERIODS_JOIN_TABLE_NAME
                + ", " + PersistentGroup.DATA_STORE_NAME + " WHERE "
                + RunImpl.DATA_STORE_NAME + ".id = " + RunImpl.PERIODS_JOIN_TABLE_NAME
                + "." + RunImpl.RUNS_JOIN_COLUMN_NAME + " AND "
                + PersistentGroup.DATA_STORE_NAME + ".id = "
                + RunImpl.PERIODS_JOIN_TABLE_NAME + "."
                + RunImpl.PERIODS_JOIN_COLUMN_NAME, (Object[]) null);
    }
    
    /*
     * SELECT * FROM runs, runs_related_to_owners, users WHERE runs.id = 
     * runs_related_to_owners.run_fk AND users.id =
     * runs_related_to_owners.owner_fk
     */
    private List<?> retrieveRunsAndOwnersListFromDb() {
    	return this.jdbcTemplate.queryForList("SELECT * FROM "
    			+ RunImpl.DATA_STORE_NAME + ", " + RunImpl.OWNERS_JOIN_TABLE_NAME
    			+ ", " + UserImpl.DATA_STORE_NAME + " WHERE "
    			+ RunImpl.DATA_STORE_NAME + ".id = " + RunImpl.OWNERS_JOIN_TABLE_NAME
    			+ "." + RunImpl.OWNERS_JOIN_COLUMN_NAME + " AND "
    			+ UserImpl.DATA_STORE_NAME + ".id = " 
    			+ RunImpl.OWNERS_JOIN_TABLE_NAME + "."
    			+ RunImpl.OWNERS_JOIN_COLUMN_NAME, (Object[]) null);
    }

}
