/**
 * Copyright (c) 2007-2015 Regents of the University of California (Regents).
 * Created by WISE, Graduate School of Education, University of California, Berkeley.
 * 
 * This software is distributed under the GNU General Public License, v3,
 * or (at your option) any later version.
 * 
 * Permission is hereby granted, without written agreement and without license
 * or royalty fees, to use, copy, modify, and distribute this software and its
 * documentation for any purpose, provided that the above copyright notice and
 * the following two paragraphs appear in all copies of this software.
 * 
 * REGENTS SPECIFICALLY DISCLAIMS ANY WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE. THE SOFTWARE AND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
 * HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 * 
 * IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
 * SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS,
 * ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package org.wise.portal.service.mail;

import java.util.Properties;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

/**
 * Helps easily construct an email message using the JavaMail Framework
 * 
 * @author Anthony Perritano
 */
@Service
public class MailService implements IMailFacade {

	@Autowired
	private Properties wiseProperties;

	@Autowired
	private JavaMailSenderImpl javaMailSender;

	/**
	 * @see net.sf.sail.webapp.mail.IMailFacade#postMail(java.lang.String[],
	 *      java.lang.String, java.lang.String, java.lang.String)
	 */
	public void postMail(String[] recipients, String subject, String message,
			String from) throws MessagingException {

		postMail(recipients, subject, message, from, null);
	}
	
	public void postMail(String[] recipients, String subject, String message,
			String from, String[] cc) throws MessagingException {
		javaMailSender.setUsername((String) wiseProperties.getProperty("mail.user"));
		javaMailSender.setPassword((String) wiseProperties.getProperty("mail.password"));
		javaMailSender.setHost((String) wiseProperties.getProperty("mail.smtp.host"));
		String portString = (String) wiseProperties.getProperty("mail.smtp.port");
		javaMailSender.setPort(Integer.valueOf(portString));
		javaMailSender.setProtocol((String) wiseProperties.getProperty("mail.transport.protocol"));
		javaMailSender.setJavaMailProperties(wiseProperties);
		MimeMessage mimeMessage = javaMailSender.createMimeMessage();
		MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, false, "UTF-8");
		helper.setFrom(from);
		helper.setText(message);
		helper.setSubject(subject);
		
		if (cc != null) {
			helper.setCc(cc);
		}
		
		for (String receiver : recipients) {
			if (receiver != null) {
				helper.setTo(receiver);
				javaMailSender.send(mimeMessage);
			}
		}
	}
}
