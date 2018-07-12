use mysql;
update user set authentication_string=PASSWORD('password') where user='root';
update user set plugin='mysql_native_password';
FLUSH PRIVILEGES;