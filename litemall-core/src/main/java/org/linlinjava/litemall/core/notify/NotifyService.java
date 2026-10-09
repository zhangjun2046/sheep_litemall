package org.linlinjava.litemall.core.notify;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.mail.MailSender;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.scheduling.annotation.Async;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * 商城通知服务类
 */
public class NotifyService {
    private final Log logger = LogFactory.getLog(NotifyService.class);

    private MailSender mailSender;
    private String sendFrom;
    private String sendTo;

    private SmsSender smsSender;
    private List<Map<String, String>> smsTemplate = new ArrayList<>();
    private List<String> operatorMobiles = new ArrayList<>();

    private List<Map<String, String>> wxTemplate = new ArrayList<>();

    public boolean isMailEnable() {
        return mailSender != null;
    }

    public boolean isSmsEnable() {
        return smsSender != null;
    }

    /**
     * 短信消息通知
     *
     * @param phoneNumber 接收通知的电话号码
     * @param message     短消息内容，这里短消息内容必须已经在短信平台审核通过
     */
    @Async
    public void notifySms(String phoneNumber, String message) {
        if (smsSender == null)
            return;

        try {
            smsSender.send(phoneNumber, message);
        } catch (Exception e) {
            logger.error("发送短信失败, phone=" + phoneNumber, e);
        }
    }

    /**
     * 短信模版消息通知
     *
     * @param phoneNumber 接收通知的电话号码
     * @param notifyType  通知类别，通过该枚举值在配置文件中获取相应的模版ID
     * @param params      通知模版内容里的参数，类似"您的验证码为{1}"中{1}的值
     */
    @Async
    public void notifySmsTemplate(String phoneNumber, NotifyType notifyType, String[] params) {
        sendSmsTemplate(phoneNumber, notifyType, params);
    }

    /**
     * 以同步的方式发送短信模版消息通知
     *
     * @param phoneNumber 接收通知的电话号码
     * @param notifyType  通知类别，通过该枚举值在配置文件中获取相应的模版ID
     * @param params      通知模版内容里的参数，类似"您的验证码为{1}"中{1}的值
     * @return
     */
    public SmsResult notifySmsTemplateSync(String phoneNumber, NotifyType notifyType, String[] params) {
        return sendSmsTemplate(phoneNumber, notifyType, params);
    }

    /**
     * 支付成功后通知运营人员（完整订单号）。发送失败只记日志。
     */
    @Async
    public void notifyPaidOrderToOperators(String orderSn) {
        notifyOperators(NotifyType.NEW_ORDER, orderSn);
    }

    /**
     * 用户申请退款或售后后通知运营人员（完整订单号）。发送失败只记日志。
     */
    @Async
    public void notifyRefundApplyToOperators(String orderSn) {
        notifyOperators(NotifyType.REFUND_APPLY, orderSn);
    }

    private void notifyOperators(NotifyType notifyType, String orderSn) {
        if (!StringUtils.hasText(orderSn) || operatorMobiles == null || operatorMobiles.isEmpty()) {
            return;
        }
        String[] params = new String[]{orderSn};
        for (String mobile : operatorMobiles) {
            sendSmsTemplate(mobile, notifyType, params);
        }
    }

    public static String formatAmount(java.math.BigDecimal amount) {
        if (amount == null) {
            return "0";
        }
        return amount.stripTrailingZeros().toPlainString();
    }

    public static String last6OrderSn(String orderSn) {
        if (!StringUtils.hasText(orderSn)) {
            return "";
        }
        int len = orderSn.length();
        return orderSn.substring(Math.max(0, len - 6));
    }

    private SmsResult sendSmsTemplate(String phoneNumber, NotifyType notifyType, String[] params) {
        if (smsSender == null) {
            return null;
        }
        if (!StringUtils.hasText(phoneNumber)) {
            return null;
        }

        try {
            String templateIdStr = getTemplateId(notifyType, smsTemplate);
            if (!StringUtils.hasText(templateIdStr) || "待补充".equals(templateIdStr.trim())) {
                logger.warn("短信模板未配置, type=" + (notifyType == null ? "null" : notifyType.getType()));
                return null;
            }
            return smsSender.sendWithTemplate(phoneNumber, templateIdStr, params);
        } catch (Exception e) {
            logger.error("发送短信失败, phone=" + phoneNumber + ", type=" + (notifyType == null ? "null" : notifyType.getType()), e);
            SmsResult smsResult = new SmsResult();
            smsResult.setSuccessful(false);
            return smsResult;
        }
    }

    /**
     * 邮件消息通知,
     * 接收者在spring.mail.sendto中指定
     *
     * @param subject 邮件标题
     * @param content 邮件内容
     */
    @Async
    public void notifyMail(String subject, String content) {
        if (mailSender == null)
            return;

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(sendFrom);
            message.setTo(sendTo);
            message.setSubject(subject);
            message.setText(content);
            mailSender.send(message);
        } catch (Exception e) {
            logger.error("发送邮件失败, subject=" + subject, e);
        }
    }

    private String getTemplateId(NotifyType notifyType, List<Map<String, String>> values) {
        if (notifyType == null || values == null) {
            return null;
        }
        for (Map<String, String> item : values) {
            if (item == null) {
                continue;
            }
            String notifyTypeStr = notifyType.getType();
            if (notifyTypeStr.equals(item.get("name"))) {
                return item.get("templateId");
            }
        }
        return null;
    }

    public void setMailSender(MailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void setSendFrom(String sendFrom) {
        this.sendFrom = sendFrom;
    }

    public void setSendTo(String sendTo) {
        this.sendTo = sendTo;
    }

    public void setSmsSender(SmsSender smsSender) {
        this.smsSender = smsSender;
    }

    public void setSmsTemplate(List<Map<String, String>> smsTemplate) {
        this.smsTemplate = smsTemplate;
    }

    public void setOperatorMobiles(List<String> operatorMobiles) {
        this.operatorMobiles = operatorMobiles;
    }

    public void setWxTemplate(List<Map<String, String>> wxTemplate) {
        this.wxTemplate = wxTemplate;
    }
}
