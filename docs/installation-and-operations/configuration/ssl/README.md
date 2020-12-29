---
sidebar_navigation:
  title: Configuring SSL
  priority: 9
---

# Configuring SSL

## Package-based installation (DEB/RPM)

SSL configuration can be applied on the first installation, or at any time by reconfiguring the application with:

```bash
sudo openproject reconfigure
```

You will be prompted with the same dialogs than on the [initial configuration](../../installation/packaged/#step-2-apache2-web-server) guide. This assumes that you select the **install** option when the **server/autoinstall** dialog appears, and that you have certificate and key files available on your server at a path you know.

## Docker-based installation

The current Docker image does not support SSL by default. Usually you would
already have an existing Apache or NginX server on your host, with SSL
configured, which you could use to set up a simple ProxyPass rule to direct
traffic to the container. Or one of the myriad of other tools (e.g. Traefik) offered by the Docker community to handle this aspect.

If you really want to enable SSL from within the container, you could try
mounting a custom apache2 directory when you launch the container with `-v
my/apache2/conf:/etc/apache2`. This would entirely replace the configuration
we're using.

## Create a free SSL certificate using let's encrypt

You can get an SSL certificate for free via Let's Encrypt.

This requires your OpenProject server to be reachable using a domain name (e.g. openproject.mydomain.com), with port 443 or 80 open. If you don't have anything running on port 80 or 443, we recommend that you first configure OpenProject without SSL support, and only then execute the steps outline below.

Here is how to do it using [certbot](https://github.com/certbot/certbot):

    sudo curl https://dl.eff.org/certbot-auto -o /usr/local/bin/certbot-auto
    sudo chmod a+x /usr/local/bin/certbot-auto
    
    certbot-auto certonly --webroot --webroot-path /opt/openproject/public -d openproject.mydomain.com

The CLI will ask for a few details and to agree to the Let's Encrypt terms of usage. Then it will perform the Let's Encrypt challenge and finally issue a certificate file and a private key file if the challenge succeeded.

At the end, it will store the certificate (`fullchain.pem`) and private key (`privkey.pem`) under `/etc/letsencrypt/live/openproject.mydomain.com/`.

You can now configure OpenProject to use them by running `openproject reconfigure`: hit ENTER until you get to the SSL wizard, and select "Yes" when the wizard asks for SSL support:

* Enter the `/etc/letsencrypt/live/openproject.mydomain.com/fullchain.pem` path when asked for the `server/ssl_cert` detail.
* Enter the `/etc/letsencrypt/live/openproject.mydomain.com/privkey.pem` path when asked for the `server/ssl_key` detail.
* Enter the `/etc/letsencrypt/live/openproject.mydomain.com/fullchain.pem` path (same as `server/ssl_cert`) when asked for the `server/ssl_ca` detail.

Hit ENTER, and after the wizard is finished your OpenProject installation should be accessible using `https://openproject.mydomain.com`.

Note that this Let's Encryt certificate is only valid for 90 days. To renew it automatically all you have to do is to add the following entry to your crontab (run `crontab -e`):

    0 1 * * * certbot-auto renew --quiet --post-hook "service apache2 restart"

This will execute `certbot renew` every day at 1am. The command checks if the certificate is expired and renews it if that is the case. The web server is restarted in a post hook in order for it to pick up the new certificate.

<div class="alert alert-warning" role="alert">

## External SSL termination

If you terminate SSL externally before the request hits the OpenProject server, you need to let the OpenProject server know that the request being handled is https, even though SSL was terminated before.   This is the most common source in problems in OpenProject when using an external server that terminates SSL.

Please ensure that if you're proxying to the openproject server, you set the HOST header to the internal server. This ensures that the host name of the outer request gets forwarded to the internal server. Otherwise you might see redirects in your browser to the internal host that OpenProject is running on.

On your outer proxying server, set these commands:

- In Apache2, set the `ProxyPreserveHost On`directive 

- In NginX, use the following value: `proxy_set_header X-Forwarded-Host $host:$server_port;`

  

If you're terminating SSL on the outer server, you need to set the `X-Forwarded-Proto https`header to let OpenProject know that the request is HTTPS, even though its been terminated earlier in the request on the outer server.

- In Apache2, use `RequestHeader set "X-Forwarded-Proto" https`
- In Nginx, use `proxy_set_header X-Forwarded-Proto https;`



Finally, to let OpenProject know that it should create links with 'https' when no request is available (for example, when sending emails), you need to set the Protocol setting of OpenProject to `https`. You will find this setting on your system settings or via the rails console with `Setting.protocol = 'https'`
